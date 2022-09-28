# EXAMPLES - How to download target data from fragalysis

```bash
#First get the url of the particular file using the copied json (from Fragalysis)
$ curl "https://fragalysis.diamond.ac.uk/api/download_structures/" -H "Content-Type: application/json"  -d '{"target_name":"nsp13","proteins":"nsp13-x0029_0A,nsp13-x0034_0B","event_info":false,"sigmaa_info":false,"diff_info":false,"trans_matrix_info":false,"NAN":false,"mtz_info":false,"cif_info":false,"NAN2":false,"map_info":false,"single_sdf_file":true,"sdf_info":false,"pdb_info":false,"bound_info":true,"metadata_info":true,"smiles_info":true,"static_link":true,"file_url":""}'
    {"file_url":"/code/media/downloads/691f1180-ae2c-4d5e-baa7-bb25c5ea8541/nsp13.zip"}sanchezg@stats2589:
#Next, use the returned url to download the actual zip file
$ curl "https://fragalysis.diamond.ac.uk/api/download_structures/?file_url=/code/media/downloads/691f1180-ae2c-4d5e-baa7-bb25c5ea8541/nsp13.zip" --output nsp13.zip
```

```python
import os
import tempfile
import requests

url = "https://fragalysis.diamond.ac.uk/api/download_structures/"

#data is the json you downloaded from Fragalysis
data = {"target_name":"nsp13","proteins":"nsp13-x0029_0A,nsp13-x0034_0B","event_info":False,"sigmaa_info":False,"diff_info":False,"trans_matrix_info":False,"NAN":False,"mtz_info":False,"cif_info":False,"NAN2":False,"map_info":False,"single_sdf_file":True,"sdf_info":False,"pdb_info":False,"bound_info":True,"metadata_info":True,"smiles_info":True,"static_link":False,"file_url":""}

#First get the url of the particular file using the copied json
r = requests.post("https://fragalysis.diamond.ac.uk/api/download_structures/", json=data)
if r.ok:
    #Next, use the returned url to download the actual zip file
    file_url = r.json()["file_url"]
    r = requests.get("https://fragalysis.diamond.ac.uk/api/download_structures?file_url=%s"%file_url, allow_redirects=True)
    if r.ok:
        with open(os.path.basename(file_url), mode="wb") as f:
            f.write(r.content)
```
