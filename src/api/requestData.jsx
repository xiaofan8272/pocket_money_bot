import Requset from "./httpMgr";

export function pinJSONToIPFS(key, secret, content) {
  return Requset({
    method: "post",
    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    headers: { 
      'Content-Type': 'application/json', 
      'pinata_api_key': key,
      'pinata_secret_api_key': secret
    },
    data : {
      content: content
    }
  });
}
