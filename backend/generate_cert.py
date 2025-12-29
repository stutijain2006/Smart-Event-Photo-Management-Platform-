import trustme
ca = trustme.CA()
ca.cert_pem.write_to_path("cert.pem")
ca.private_key_pem.write_to_path("key.pem")