use tauri::menu::{ContextMenu, MenuBuilder, MenuItem};
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
use tauri::{Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let item = MenuItem::new(app, "Exibir", true, Some("E")).unwrap();
            let menu = MenuBuilder::new(app)
                .item(&item)
                .build()
                .unwrap();
            
            let window = app.get_webview_window("main").unwrap();
            let window_hider = window.clone();
            
            let _ = TrayIconBuilder::new()
                .tooltip("Personal Addiction Tracker App")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_tray_icon_event(|tray_icon, event| match event {
                    TrayIconEvent::Click {id, position, rect, button, button_state} => {
                        match button {
                            MouseButton::Left => {
                            
                                dbg!("system tray received a left click");

                                let window = tray_icon.app_handle().get_webview_window("main").unwrap();
                                let _ = window.show().unwrap();
                                let logical_size = tauri::LogicalSize::<f64> {
                                    width: 1024.00,
                                    height: 768.00,
                                };
                                let logical_s = tauri::Size::Logical(logical_size);
                                let _ = window.set_size(logical_s);
                                let logical_position = tauri::LogicalPosition::<f64> {
                                    x: position.x - logical_size.width,
                                    y: position.y - logical_size.height - 30.,
                                };
                                let logical_pos: tauri::Position =
                                    tauri::Position::Logical(logical_position);
                                let _ = window.set_position(logical_pos);
                                let _ = window.set_focus();
                            },
                            MouseButton::Right => {
                                dbg!("system tray received a right click");
                                let window = tray_icon.app_handle().get_webview_window("main").unwrap();
                                window.hide().unwrap();
                            },
                            MouseButton::Middle => {
                                //menu.popup(window_hider);
                                dbg!("system tray received a middle click");
                            }
                        }
                    },
                    _ => {
                        dbg!("system tray received an unknow event");
                    }
                })
                .build(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
