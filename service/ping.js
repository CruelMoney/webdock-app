import {api_url} from '../config/config';

export async function getPing(api_key){
    try{
        let request=await fetch(api_url+"ping",{
            method:'GET',
            headers: {
                'Authorization': 'Bearer '+api_key
            }
        });
        let result=await request.json();
        request=null;
        return result;
    }catch{

    }
}