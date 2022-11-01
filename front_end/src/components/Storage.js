import { Web3Storage } from 'web3.storage'

async function getAccessToken () {
  return await process.env.WEB3STORAGE_TOKEN
}

async function makeStorageClient () {
  return await new Web3Storage({ token: getAccessToken() })
}

function getFiles () {
    const fileInput = document.querySelector('input[type="file"]')
    return fileInput.files
}

function makeFileObjects (campaignname, campaigninfo, extrainfo, videolink) {
    // You can create File objects from a Blob of binary data
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // Here we're just storing a JSON object, but you can store images,
    // audio, or whatever you want!
    const obj = { 
      campaignName: campaignname,
      campaignInfo: campaigninfo,
      videoLink: videolink,
      extraInfo: extrainfo
      }
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
  
    const files = [
      //new File(['contents-of-file-1'], 'plain-utf8.txt'),
      new File([blob], 'campaign.json')
    ]
    return files
}

async function storeFiles (files) {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5NUU2RmU5MjA2M0IyZGZmODNGZDU5NUI5NTg0MDdEOGJCNkIxMjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjcxNDEyNjA2MjIsIm5hbWUiOiJjYW1wYWlnbkluZm8ifQ.rcON5wbxjYdkuBe4qaUeg4pgXnG_MCaf8mcoOxJQddo';
    console.log("token =",token);
    const client = new Web3Storage({ token })
    //const client = await makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
}

export{
    storeFiles,
    makeFileObjects
}