class Note {
  constructor({editor = "#main", prefix="Note"}){
    this.MAX_ARTICLE_NUM = 20;
    this.KEY_PREFIX = prefix;

    this.editor = editor;
    this.edittingKey = (localStorage.edittingKey) ? localStorage.edittingKey : undefined;

    this.articleKeys = [];
  }


  run(){
    this.findEditableArea();
    this.makeEditableArea();
    this.makeEditableAreaFocus();
    this.makeMenu();
    this.readInitText();
    this.makeButtonToCreateNewArticle();
    this.makeButtonToSave();
    this.showWitchKeyIsPressed();
  }

  findEditableArea(){
    this.editableArea = document.querySelector(this.editor)
  }
  makeEditableArea(){
    this.editableArea.contentEditable = true
  }
  makeEditableAreaFocus(){
    this.editableArea.focus()
  }
  makeMenu(){
    this.formatMenu();
    this.readKeysFromStorage();

    var replaceTarget = new RegExp(this.KEY_PREFIX);
    for( let index of this.articleKeys ){
      this.createButton(
        this.articleKeys[index], this.articleKeys[index].replace(replaceTarget,'')
      );
    }
  }
  readInitText(){
    if( this.edittingKey && localStorage[this.edittingKey] != undefined ){
      this.editableArea.innerHTML = localStorage[this.edittingKey]
      this.showCurrentArticleKey()
    } else {
      var id = this.createNewArticle();
      this.edittingKey = id;
      this.switchText(id);
      this.makeMenu();
    }
  }
  makeButtonToSave(){
    this.editableArea.addEventListener('keyup', () => {
      localStorage.setItem(this.edittingKey, this.editableArea.innerHTML);
    })
  }

  makeButtonToCreateNewArticle(){
    document.querySelector('.btn_create').addEventListener('click', () => {
      var id = this.createNewArticle();
      this.switchText(id)
      this.makeMenu();
    })
  }

  createNewArticle(){
    if(this.articleKeys.length > this.MAX_ARTICLE_NUM){
      alert('記事は'+this.MAX_ARTICLE_NUM+'以上作成できません')
      return
    }
    var randID = Math.round(Math.random()*100000000000000); // かっこ良くしたい。
    localStorage.setItem(this.KEY_PREFIX+randID,'');

    return this.KEY_PREFIX+randID;
  }

  // 以下切り出したメソッド
  showCurrentArticleKey(){
    document.querySelector('.edittingKey').innerHTML = this.edittingKey
  }
  formatMenu(){
    // 初期化
    if( this.articleKeys.length > 0){
      this.removeChildren(document.querySelector('#menu'))
      this.articleKeys = []
    }
  }
  removeChildren(node){
    var nodes = node.children
    for(var i = nodes.length-1; i >= 0; i--){
      node.removeChild(nodes[i])
    }
  }
  readKeysFromStorage(){
    var keys = []
    for(let prop of localStorage){
      // KEY_PREFIXから始まるkeyのみ取得
      if( new RegExp("^" + this.KEY_PREFIX).test(prop) ){
        keys.push(prop)
      }
    }
    this.articleKeys = keys;
  }

  createButton(item, index){
    // メニューにボタンを追加.
    var textNode = document.createTextNode('テキストID: ' + String(index));
    var btn = document.createElement('button');
    var li = document.createElement('li')

    li.appendChild(btn);
    btn.appendChild(textNode);

    var dataKey = this.KEY_PREFIX + index;
    btn.setAttribute('data-key', dataKey);
    btn.setAttribute('class', 'btn_switch');
    document.getElementById('menu').appendChild(li);

    btn.addEventListener('click', this.switchText(dataKey));

    var deleteBtn = document.createElement('button')
    deleteBtn.appendChild(document.createTextNode('delete'));
    deleteBtn.setAttribute('data-key', dataKey);
    deleteBtn.setAttribute('class', 'btn_delete');
    li.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', this.deleteText(dataKey))
  }

  // 以下エディターの操作
  switchEdittingKey(key){
    this.edittingKey = key
    this.showCurrentArticleKey()
    localStorage.setItem("edittingKey", this.edittingKey);
  }
  switchText(key){
    this.switchEdittingKey(key)
    this.editableArea.innerHTML = localStorage[key]
    this.editableArea.focus()
  }
  deleteText(key){
    if( confirm('削除しておｋ?') ){
      delete localStorage[key]
      this.makeMenu();
      this.switchText(this.articleKeys[0]);
    }
  }


  saveToServer(){
    // いずれrailsに送る
    // keyupで送ると通信がパンクするのでintervalおいてセーブする
  }
  showWitchKeyIsPressed(){
    // 取得したkeyCodeを元にショートカットを定義づける(いずれ)
    this.editableArea.addEventListener('keypress', function(e){ console.log(e.keyCode) })
  }

}
