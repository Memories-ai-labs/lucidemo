use std::sync::mpsc;
use std::thread;
use std::time::Instant;
use tauri::{AppHandle, Emitter, Manager};

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

enum HotkeySignal {
    Start,
    Stop,
}

/// Use NSEvent.addGlobalMonitorForEvents to detect double-tap Option.
/// This is more stable than CGEventTap (no separate run loop / mach port issues).
#[cfg(target_os = "macos")]
fn setup_option_doubletap(app_handle: tauri::AppHandle) {
    use std::cell::Cell;
    use std::ptr::NonNull;
    use block2::RcBlock;
    use objc2_app_kit::{NSEvent, NSEventMask, NSEventModifierFlags};

    let (tx, rx) = mpsc::channel::<HotkeySignal>();

    // Emitter thread: receives signals and emits Tauri events
    let handle = app_handle.clone();
    thread::spawn(move || {
        while let Ok(signal) = rx.recv() {
            if let Some(win) = handle.get_webview_window("island") {
                match signal {
                    HotkeySignal::Start => { let _ = win.emit("recording-start", ()); }
                    HotkeySignal::Stop  => { let _ = win.emit("recording-stop", ()); }
                }
            }
        }
    });

    // State for double-tap detection (Cell for interior mutability in Fn closure)
    let last_release: Cell<Option<Instant>> = Cell::new(None);
    let recording: Cell<bool> = Cell::new(false);
    let threshold = std::time::Duration::from_millis(400);

    let block = RcBlock::new(move |_event: NonNull<NSEvent>| {
        let event = unsafe { _event.as_ref() };
        let flags = event.modifierFlags();
        let option_down = flags.contains(NSEventModifierFlags::Option);

        if !option_down {
            // Option was just released
            let now = Instant::now();

            if recording.get() {
                recording.set(false);
                let _ = tx.send(HotkeySignal::Stop);
                last_release.set(None);
            } else if let Some(prev) = last_release.get() {
                if now.duration_since(prev) < threshold {
                    recording.set(true);
                    let _ = tx.send(HotkeySignal::Start);
                    last_release.set(None);
                } else {
                    last_release.set(Some(now));
                }
            } else {
                last_release.set(Some(now));
            }
        }
    });

    // Register global monitor on the main thread (runs on NSApp's run loop)
    let _monitor = unsafe {
        NSEvent::addGlobalMonitorForEventsMatchingMask_handler(
            NSEventMask::FlagsChanged,
            &block,
        )
    };

    // Leak the monitor so it stays alive for the app's lifetime.
    // (Tauri's main run loop keeps spinning, so this is fine.)
    std::mem::forget(_monitor);
}

#[cfg(not(target_os = "macos"))]
fn setup_option_doubletap(_app_handle: tauri::AppHandle) {}

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

            if !is_accessibility_trusted() {
                eprintln!(
                    "[LUCI] Accessibility permission not granted. \
                     Go to System Settings → Privacy & Security → Accessibility."
                );
                return Ok(());
            }

            setup_option_doubletap(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
