import {api_url} from '../config/config';

export async function getEvents(api_key){
    try{
        let request=await fetch(api_url+"events?per_page=50",{
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