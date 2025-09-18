use tauri::menu::{MenuBuilder, MenuItem};
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
use tauri::{App, AppHandle, Manager, WindowEvent};

#[cfg(desktop)]
pub fn setup_system_tray_icon(app: &mut App) {
    // hiddens the main window before the app loads
    app.get_webview_window("main").unwrap().hide().unwrap();
    app.get_webview_window("splashscreen")
        .unwrap()
        .show()
        .unwrap();

    let item_show = MenuItem::new(app, "Show/Hide", true, Some("E")).unwrap();
    let item_quit = MenuItem::new(app, "Quit", true, Some("R")).unwrap();
    let menu = MenuBuilder::new(app)
        .item(&item_show)
        .item(&item_quit)
        .build()
        .unwrap();

    let window = app.get_webview_window("main").unwrap();
    let window_hider = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            window_hider.hide().unwrap();
        }
    });

    let _ = TrayIconBuilder::new()
        .tooltip("Personal Addiction Tracker App")
        .temp_dir_path(app.path().app_cache_dir().unwrap())
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
                        dbg!("system tray received a right click");
                        let window =
                            tray_icon.app_handle().get_webview_window("main").unwrap();
                        let display = match window.is_visible() {
                            Ok(visible) => {
                                if visible {
                                    window.hide()
                                } else {
                                    window.show()
                                }
                            },
                            Err(_) => window.show()
                        };
                        //window.hide().unwrap();
                        display.unwrap();
                    }
                    _ => {
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
}

#[cfg(desktop)]
#[tauri::command]
pub fn set_frontend_complete(
    app: AppHandle,
) -> Result<(), ()> {

    let splash_window;
    if app.get_webview_window("splashscreen").is_some() {
        splash_window = app.get_webview_window("splashscreen").unwrap();
    } else {
        return Err(());
    }
    let main_window = app.get_webview_window("main").unwrap();
    
    //main_window.set_enabled(true).unwrap();
    main_window.show().unwrap();

    std::thread::spawn(move || {
        splash_window.hide().unwrap();
        std::thread::sleep(std::time::Duration::from_secs(1));
        splash_window.close().unwrap();
        dbg!("Closed the splashscreen window!");
    });

    Ok(())
}
