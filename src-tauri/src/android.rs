use serde::{Deserialize, Serialize};

#[cfg(not(desktop))]
#[derive(Deserialize, Serialize)]
struct Return {
    path: String,
    msg: String,
    result: bool,
}

#[cfg(not(desktop))]
#[tauri::command]
pub fn save_backup_file(backup_str: String) -> Return {
    let path = "/storage/emulated/0/Android/data/com.addictiontracker/files/backup.txt";
    // tries to save data to a file
    match std::fs::write(path, backup_str) {
        Ok(_) => { 
            println!("Sucesso escrevendo no arquivo"); 
            return Return {
                path: path.to_string(),
                msg: "Salvo com sucesso!".to_string(),
                result: true,
            }
        },
        Err(e) => { 
            println!("Erro: {}", e);
            return Return {
                path: path.to_string(),
                msg: format!("Erro: {}", e),
                result: false
            };
        }
    }
}