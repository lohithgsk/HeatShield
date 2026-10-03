import os  
css = open('client/src/index.css','r',encoding='utf-8').read()  
additions = '/* live-dot */.live-dot{display:inline-block;width:7px;height:7px;border-radius:50%%;background:#34d399;box-shadow:0 0 6px #34d399;animation:pulse-dot 1.5s infinite;margin-left:2px;}@keyframes pulse-dot{0%%,100%%{opacity:1;}50%%{opacity:0.4;}}'  
open('client/src/index.css','a',encoding='utf-8').write(additions) if 'live-dot' not in css else None  
print('Done')  
