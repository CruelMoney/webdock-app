import {api_url} from '../config/config';

export async function getAccountInformations(api_key){
    try{
        let request=await fetch(api_url+"account/accountInformation",{
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