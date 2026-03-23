use rdev::{listen, Event, EventType, Key};
use std::thread;
use tauri::{AppHandle, Emitter, Manager};

/// Check macOS Accessibility permission before starting rdev.
/// Without it, CGEventTap returns null → crash.
#[cfg(target_os = "macos")]
fn is_accessibility_trusted() -> bool {
    #[link(name = "ApplicationServices", kind = "framework")]
    extern "C" {
        fn AXIsProcessTrusted() -> bool;
    }
    unsafe { AXIsProcessTrusted() }
}

#[cfg(not(target_os = "macos"))]
fn is_accessibility_trusted() -> bool {
    true
}

/// Called from island window after speech-to-text completes.
#[tauri::command]
fn send_to_channel(app: AppHandle, text: String) {
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.emit("add-to-channel", text);
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, send_to_channel])
        .setup(|app| {
            // ── Position island at top-center ─────────────────────────────
            if let Some(island) = app.get_webview_window("island") {
                if let Ok(Some(monitor)) = island.primary_monitor() {
                    let screen_w = monitor.size().width;
                    let scale    = monitor.scale_factor();
                    let win_w    = 320_f64;
                    let x = ((screen_w as f64 / scale) / 2.0 - win_w / 2.0) as i32;
                    let _ = island.set_position(tauri::Position::Logical(
                        tauri::LogicalPosition { x: x as f64, y: 6.0 },
                    ));
                }
            }

            // ── Global key listener (Option/⌥ key as hold-to-talk) ────────
            // Requires macOS Accessibility permission.
            // Fn key is intentionally excluded — it's system-reserved on macOS 12+.
            if !is_accessibility_trusted() {
                eprintln!(
                    "[LUCI] Accessibility permission not granted. \
                     Go to System Settings → Privacy & Security → Accessibility \
                     and enable this app to use voice input."
                );
                return Ok(());
            }

            let app_handle = app.handle().clone();
            thread::spawn(move || {
                let mut pressed = false;

                // catch_unwind won't catch signals but guards against panics
                let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                    let _ = listen(move |event: Event| {
                        match event.event_type {
                            EventType::KeyPress(Key::Alt) if !pressed => {
                                pressed = true;
                                if let Some(win) = app_handle.get_webview_window("island") {
                                    let _ = win.emit("recording-start", ());
                                }
                            }
                            EventType::KeyRelease(Key::Alt) if pressed => {
                                pressed = false;
                                if let Some(win) = app_handle.get_webview_window("island") {
                                    let _ = win.emit("recording-stop", ());
                                }
                            }
                            _ => {}
                        }
                    });
                }));

                eprintln!("[LUCI] rdev listener exited.");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
