export async function getNews(api_key) {
  try {
    let request = await fetch(
      'https://app.webdock.io/en/app_data/getLatestNews?secret=bf34eaa48c2643bb9bec16e8f46d88d8',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + api_key,
        },
      },
    );
    let result = await request.json();
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
