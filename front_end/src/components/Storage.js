import { Web3Storage } from 'web3.storage'

async function getAccessToken () {
  return process.env.REACT_APP_WEB3STORAGE_TOKEN
}

async function makeStorageClient () {
  return await new Web3Storage({ token: getAccessToken() })
}

function getFiles () {
    const fileInput = document.querySelector('input[type="file"]')
    return fileInput.files
}

function makeFileObjects (campaignName, campaignInfo, extraInfo, videoLink, cidImg) {
    // You can create File objects from a Blob of binary data
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // Here we're just storing a JSON object, but you can store images,
    // audio, or whatever you want!
    const obj = { 
      campaignName,
      campaignInfo,
      videoLink,
      cidImg,
      extraInfo
      }
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
  
    const files = [new File([blob], 'campaign.json')]
 
    return files
}

function makeRequestObjects (requestTitle, requestInfo) {
  const obj = { 
    requestTitle,
    requestInfo,
    }
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })

  const files = [new File([blob], 'campaign.json')]

  return files
}

async function storeImg (files) {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5NUU2RmU5MjA2M0IyZGZmODNGZDU5NUI5NTg0MDdEOGJCNkIxMjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjcxNDEyNjA2MjIsIm5hbWUiOiJjYW1wYWlnbkluZm8ifQ.rcON5wbxjYdkuBe4qaUeg4pgXnG_MCaf8mcoOxJQddo';
  const client = new Web3Storage({ token })
  const cid = await client.put(files, { name: 'Image' })
  console.log('stored files with cid:', cid)
  return cid
}

async function storeFiles (files) {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5NUU2RmU5MjA2M0IyZGZmODNGZDU5NUI5NTg0MDdEOGJCNkIxMjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjcxNDEyNjA2MjIsIm5hbWUiOiJjYW1wYWlnbkluZm8ifQ.rcON5wbxjYdkuBe4qaUeg4pgXnG_MCaf8mcoOxJQddo';
    const client = new Web3Storage({ token })
    //const client = await makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
}

async function retrieveFiles  (cid) {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5NUU2RmU5MjA2M0IyZGZmODNGZDU5NUI5NTg0MDdEOGJCNkIxMjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjcxNDEyNjA2MjIsIm5hbWUiOiJjYW1wYWlnbkluZm8ifQ.rcON5wbxjYdkuBe4qaUeg4pgXnG_MCaf8mcoOxJQddo';
  const client = new Web3Storage({ token })
  const res = await client.get(cid)
  console.log(`Got a response! [${res.status}] ${res.statusText}`)
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`)
  }
  
  // unpack File objects from the response
  const files = await res.files()
  for (const file of files) {
    console.log(`${file.cid} -- ${file.path} -- ${file.size}`)
  }
  return files
}

async function loadData(cid) {
  const response = await fetch("https://ipfs.io/ipfs/"+cid+"/campaign.json");
  const content = await response.json();
  console.log(content); 
  return content
}

async function loadImg(cid) {
  const response = "https://ipfs.io/ipfs/"+cid;
  return response
}

const retrieveData = async (cid) => {
  try {
    const files = await retrieveFiles(cid);
    const content = await loadData(files[0].cid);
    return content;
  } catch (error) {
    console.log("error", error);
  }
};

const retrieveImg = async (setImg, cid) => {
  try {
    const files = await retrieveFiles(cid);
    const url = await loadImg(files[0].cid);
    setImg(url);
    console(url,"url")
    return url;
  } catch (error) {
    console.log("error", error);
  }
};

export{
    storeFiles,
    makeFileObjects,
    retrieveFiles,
    loadData,
    retrieveData,
    retrieveImg,
    storeImg,
    loadImg,
    makeRequestObjects
}