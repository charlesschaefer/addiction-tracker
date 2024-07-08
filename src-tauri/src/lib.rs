#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri::menu::{MenuBuilder, MenuItem};
#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
#[cfg(not(any(target_os = "android", target_os = "ios")))]

use tauri::{Manager, WindowEvent};


#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // An example of how to run a notification from Tauri Rust code
            //use tauri_plugin_notification::NotificationExt;
            //app.notification()
            //    .builder()
            //    .title("Nova notificação")
            //    .body("Você recebeu uma nova notificação")
            //    .show()
            //    .unwrap();

            let item_show = MenuItem::new(app, "Exibir/Ocultar", true, Some("E")).unwrap();
            let item_quit = MenuItem::new(app, "Sair", true, Some("R")).unwrap();
            let menu = MenuBuilder::new(app)
                .item(&item_show)
                .item(&item_quit)
                .build()
                .unwrap();

            let window = app.get_webview_window("main").unwrap();
            let window_hider = window.clone();
            window.on_window_event(move |event| {
                match event {
                    WindowEvent::CloseRequested { api, .. } => {
                        api.prevent_close();
                        window_hider.hide().unwrap();
                        
                        use tauri_plugin_notification::NotificationExt;
                        window_hider.app_handle().notification()
                            .builder()
                            .title("Não fechamos")
                            .body("O addiction-tracker não fechou, só está oculto na sua bandeja do sistema.")
                            .show()
                            .unwrap();
                    },
                    _ => {}
                }
            });

            let _ = TrayIconBuilder::new()
                .tooltip("Personal Addiction Tracker App")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_tray_icon_event(|tray_icon, event| match event {
                    TrayIconEvent::Click {
                        id: _,
                        position: _,
                        rect: _,
                        button,
                        button_state: _,
                    } => {
                        match button {
                            MouseButton::Left => {
                                /* dbg!("system tray received a left click");

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
                                MouseButton::Right => {*/
                                dbg!("system tray received a right click");
                                let window =
                                    tray_icon.app_handle().get_webview_window("main").unwrap();
                                window.hide().unwrap();
                            }
                            _ => {
                                //menu.popup(window_hider);
                                dbg!("system tray received a middle click");
                            }
                        }
                    }
                    _ => {
                        dbg!("system tray received an unknow event");
                    }
                })
                .on_menu_event(move |app, event| {
                    let quit = item_quit.clone();
                    let show = item_show.clone();
                    if event.id() == quit.id() {
                        app.exit(0);
                    } else if event.id() == show.id() {
                        let window = app.get_webview_window("main").unwrap();
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                        }
                    }
                })
                .build(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[cfg(any(target_os = "android", target_os = "ios"))]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
