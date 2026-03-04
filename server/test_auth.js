const run = async () => {
    const formdata = new FormData();
    formdata.append('images', new Blob(['test'], { type: 'text/plain' }), 'test.txt');

    const headers = {
        Authorization: 'Bearer dummytoken123'
    };

    const res = await fetch('http://localhost:8000/api/category/upload-images', {
        method: 'POST',
        headers,
        body: formdata,
    });
    console.log(res.status);
    console.log(await res.text());
}
run();
