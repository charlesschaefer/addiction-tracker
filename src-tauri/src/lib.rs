use tauri::Emitter;
use serde::{Deserialize, Serialize};
use std::env;


#[cfg(desktop)]
mod desktop;

#[cfg(not(desktop))]
mod android;

mod mdns;
mod http;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
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
            add_notification,
            get_google_secrets
        ]
    );

    let v1 = env!("GOOGLE_GEMINI_PROJECT_NAME").to_string();
    let v2 = env!("GOOGLE_GEMINI_API").to_string();
    println!("Valores da API: {} => {}", v1, v2);
    
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn add_notification(app_handle: tauri::AppHandle, title: String, body: String) {
    use tauri_plugin_notification::NotificationExt;
    let _ = app_handle.emit("msg", "Starting to build the notification");
    let mut builder = app_handle.notification().builder();
    let _ = app_handle.emit("msg", "Notification built. Let's add title and body");
    builder = builder.title(title)
        .body(body);
    let _ = app_handle.emit("msg", "Notification ready. Let's show it");
    builder.show()
        .unwrap();
}

#[derive(Deserialize, Serialize)]
struct Secrets {
    project: String,
    api_key: String,
}

#[tauri::command]
fn get_google_secrets() -> Secrets {
    return Secrets {
        project: env!("GOOGLE_GEMINI_PROJECT_NAME").to_string(),
        api_key: env!("GOOGLE_GEMINI_API").to_string(),
    }
}