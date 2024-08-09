#[cfg(desktop)]
mod desktop;

#[cfg(not(desktop))]
mod android;

mod mdns;
mod http;



//#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[cfg(desktop)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            #[cfg(desktop)]
            desktop::setup_system_tray_icon(app);

            Ok(())
        });
    
    builder = builder.invoke_handler(
        tauri::generate_handler![
            mdns::search_network_sync_services,
            mdns::broadcast_network_sync_services,
            http::start_http_server,
            #[cfg(desktop)]
            desktop::set_frontend_complete,
            #[cfg(not(desktop))]
            android::save_backup_file,
        ]
    );
    
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
