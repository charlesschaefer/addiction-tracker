use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};

#[tauri::command]
pub async fn search_network_sync_services() -> String {
    discover_service().await
}

#[tauri::command]
pub async fn broadcast_network_sync_services() {
    dbg!("Let's call broadcast_service()");
    broadcast_service();
}

pub async fn discover_service() -> String {
    // Create a daemon
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");

    // Browse for a service type.
    let service_type = "_addictiontracker._udp.local.";
    let receiver = mdns.browse(service_type).expect("Failed to browse");

    let my_ip = local_ip_addr::get_local_ip_address().unwrap();

    // Receive the browse events in sync or async. Here is
    // an example of using a thread. Users can call `receiver.recv_async().await`
    // if running in async environment.
    'outer: while let Ok(event) = receiver.recv_async().await {
        match event {
            ServiceEvent::ServiceResolved(info) => {
                dbg!("Resolved a new service: {}", info.get_fullname());
                let addresses_iter = info.get_addresses().into_iter();
                for ip in addresses_iter {
                    if ip.to_string() == my_ip {
                        continue 'outer;
                    }
                }
                let ipv4 = info.get_addresses_v4().into_iter().next().unwrap();
                // closes the connection, since we found the service
                mdns.shutdown().unwrap();
                return ipv4.to_string();
            }
            other_event => {
                dbg!("Received other event: {:?}", &other_event);
            }
        }
    }
    "".to_string()
    // Gracefully shutdown the daemon.
    //std::thread::sleep(std::time::Duration::from_secs(100));
    //mdns.shutdown().unwrap();
}

pub fn broadcast_service() {
    // Create a daemon
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");
    let ip_string = local_ip_addr::get_local_ip_address().unwrap();
    let host = hostname::get().unwrap();
    let mut host_string = host.to_str().unwrap().to_string();
    host_string.push_str(".local.");

    // Create a service info.
    let service_type = "_addictiontracker._udp.local.";
    let instance_name = "local";
    let ip = ip_string.as_str();
    let host_name = host_string.as_str();
    let port = 5200;
    let properties = [("property_1", "test"), ("property_2", "1234")];

    let my_service = ServiceInfo::new(
        service_type,
        instance_name,
        host_name,
        ip,
        port,
        &properties[..],
    ).unwrap();
    // Register with the daemon, which publishes the service.
    mdns.register(my_service).expect("Failed to register our service");


    // Gracefully shutdown the daemon
    std::thread::sleep(std::time::Duration::from_secs(1));
    mdns.shutdown().unwrap();
}