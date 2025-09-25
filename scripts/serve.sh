#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-8080}"
echo "Preview: http://127.0.0.1:${PORT}"
echo "Serving ./dist ..."
cd dist
# ultra-minimal static server in pure Node
node -e "
const http=require('http'),fs=require('fs'),p=require('path');
const port=${PORT};
http.createServer((req,res)=>{
  let f = p.join(process.cwd(), req.url.split('?')[0].replace(/\/$/,'/index.html'));
  if(!fs.existsSync(f)){f=p.join(process.cwd(),req.url.replace(/^\//,''));}
  if(!fs.existsSync(f)){f='index.html';}
  fs.readFile(f,(e,d)=>{ if(e){res.writeHead(404);res.end('not found');return;}
    const ext=p.extname(f).slice(1);
    const m={html:'text/html',css:'text/css',js:'text/javascript',xml:'application/xml','txt':'text/plain','jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','webp':'image/webp'}[ext]||'text/plain';
    res.writeHead(200,{'content-type':m});res.end(d);
  });
}).listen(port,()=>console.log('listening',port));
"