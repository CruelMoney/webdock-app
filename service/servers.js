import {api_url} from '../config/config';

export async function getServers(api_key){
    try{
        let request=await fetch(api_url+"servers?status=active",{
            method:'GET',
            headers: {
                'Authorization': 'Bearer '+api_key
            },
        
        });
        let result=await request.json();
        request=null;
        return result;
    }catch(error){
        console.log("Api call error");
        alert(error.message);
     };
    
}