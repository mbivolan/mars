

"lastStartTimestamp": "2020-09-23T10:04:41.156-07:00",
"lastStopTimestamp": "2020-10-18T15:59:25.872-07:00",

model gcp_ip_data {
    instance_id String    @id
    ip_address  String?
    ip_type     String?
    first_seen  DateTime?
    last_seen   DateTime?
  }
  
  gcp_license_data
  model gcp_license_data {
    instance_id String    @id
    license     String?
    first_seen  DateTime?
    last_seen   DateTime?
  }

  model gcp_project_data {
    project_id    String    @id
    project_name  String?
    project_owner String?
    product       String?
    expensetype   String?
    organization  String?
    first_seen    DateTime?
    last_seen     DateTime?
  }

module.exports = { LogWritter }
