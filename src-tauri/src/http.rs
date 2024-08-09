use std::thread;
use tiny_http::{Request, Response, ResponseBox, Header};


#[tauri::command]
pub fn start_http_server(otp_code: String, backup_data: String) {
    thread::spawn(|| {
        let mut server = HttpServer::new();
        server.start_server(otp_code, backup_data);
    });
}

struct HttpServer {
    otp_code: String,
    json_data: String,
}

impl HttpServer {
    fn new() -> Self {
        Self {
            otp_code: String::new(),
            json_data: String::new()
        }
    }
    
    fn start_server(&mut self, otp_code: String, backup_data: String) {
        self.otp_code = otp_code;
        self.json_data = backup_data;

        let server = tiny_http::Server::http("0.0.0.0:9099").unwrap();
        loop {
            // waits for the handshake connection
            let request = match server.recv() {
                Ok(req) => {
                    let method = req.method().as_str();
                    if method != "POST" && method != "OPTIONS" {
                        dbg!("Wrong url or method");
                        // without a response, tiny_http returns a 505 HTTP ERROR
                        continue;
                    }
                    req
                },
                Err(_err) => {
                    dbg!("Couldn't receive the request.");
                    return ;
                }
            };
            let response = self.handle_incoming_request(&request);
            
            if let Some(response) = response {
                let _ = request.respond(response);
                continue;
            } else {
                // finishes the listening loop
                break;
            }
        }
    }

    fn handle_incoming_request(&self, request: &Request) -> Option<ResponseBox> {
        if request.method().as_str() == "OPTIONS" {
            dbg!("Received a OPTIONS method");
            let response = self.response_with_cors_headers("");
            dbg!("Returned the response");
            return response;
        }
        
        if request.url() == "/handshake" {
            dbg!("Received a POST method on /handshake url");
            return self.handshake(request);
        }

        if request.url() == "/disconnect" {
            dbg!("Received the disconnect command");
            return None;
        }
        None
    }

    fn handshake(&self, request: &Request) -> Option<ResponseBox> {
        let otp_token = request
            .headers()
            .into_iter()
            .find_map(|header| {
                dbg!("Header {:?} with value {:?}", header.field.as_str(), header.value.as_str());
                if header.field.as_str() == "X-SIGNED-TOKEN" {
                    dbg!("Returned the header {:?}", header.value.as_str());
                    return Some(header.value.as_str());
                }
                None
            }).unwrap();
        dbg!("Valor to token: {:?}", &otp_token);

        if otp_token.len() == 0 {
            let response = Response::from_string("Empty token".to_string())
                        .with_status_code(500).boxed();
            return Some(response);
        }
        self.response_with_cors_headers(&self.json_data.as_str())
    }

    fn response_with_cors_headers(&self, resp: &str) -> Option<ResponseBox> {
        let header1 = Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap();
        let header2 = Header::from_bytes(&b"Access-Control-Allow-Headers"[..], &b"*"[..]).unwrap();
        // received the otp, now we're going to respond with the encrypted json
        let response = Response::from_string(resp)
            .with_header(header1)
            .with_header(header2)
            .boxed();
        Some(response)
    }
}