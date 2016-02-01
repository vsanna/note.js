var Note = function(config){
  this.MAX_ARTICLE_NUM = 20;
  this.KEY_PREFIX = (config.prefix) ? config.prefix : 'Note';
  this.editor = (config.editor) ? config.editor : '#main';
  this.edittingKey = (localStorage.edittingKey) ? localStorage.edittingKey : undefined;
  this.articleKeys = [];

  // こうしたい。
  // { selector: {
  //     editor: '#main',
  //     menu: '#menu',
  //     edittingKey: '.edittingKey',
  //     btnSwitch: '.btn_switch',
  //     btnCreate: '.btn_create',
  //   },
  //   prefix: 'OrenoEditor'
  // }

}

Note.prototype = {
  run: function(){
    this.findEditableArea();
    this.makeEditableArea();
    this.makeEditableAreaFocus();
    this.makeMenu();
    this.readInitText();
    this.makeButtonToCreateNewArticle();
    this.makeButtonToSave();

    this.showWitchKeyIsPressed();
  },
  findEditableArea: function(){
    this.editableArea = document.querySelector(this.editor)
  },
  makeEditableArea: function(){
    this.editableArea.contentEditable = true
  },
  makeEditableAreaFocus: function(){
    this.editableArea.focus()
  },
  makeMenu: function(){
    this.formatMenu();
    this.readKeysFromStorage();

    var replaceTarget = new RegExp(this.KEY_PREFIX);
    for( var index in this.articleKeys ){
      this.createButton(this.articleKeys[index], this.articleKeys[index]);
    }
  },
  readInitText: function(){
    if( this.edittingKey && localStorage[this.edittingKey] != undefined ){
      this.editableArea.innerHTML = localStorage[this.edittingKey]
      this.showCurrentArticleKey()
    } else {
      var id = this.createNewArticle();
      this.edittingKey = id;
      this.switchText(id);
      this.makeMenu();
    }
  },
  makeButtonToSave: function(){
    this.editableArea.addEventListener('keyup', (function(){
      localStorage.setItem(this.edittingKey, this.editableArea.innerHTML);
    }).bind(this))
  },
  makeButtonToCreateNewArticle: function(){
    document.querySelector('.btn_create').addEventListener('click', (function(){
      var id = this.createNewArticle();
      this.switchText(id)
      this.makeMenu();
    }).bind(this))
  },
  createNewArticle: function(){
    if(this.articleKeys.length > this.MAX_ARTICLE_NUM){
      alert('記事は'+this.MAX_ARTICLE_NUM+'以上作成できません')
      return
    }
    var randID = Math.round(Math.random()*100000000000000); // かっこ良くしたい。
    localStorage.setItem(this.KEY_PREFIX+randID,'');

    return this.KEY_PREFIX+randID;
  },

  // 以下切り出したメソッド
  showCurrentArticleKey: function(){
    document.querySelector('.edittingKey').innerHTML = this.edittingKey
  },
  formatMenu: function(){
    // 初期化
    if( this.articleKeys.length > 0){
      this.removeChildren(document.querySelector('#menu'))
      this.articleKeys = []
    }
  },
  removeChildren: function(node){
    var nodes = node.children
    for(var i = nodes.length-1; i >= 0; i--){
      node.removeChild(nodes[i])
    }
  },
  readKeysFromStorage: function(){
    var keys = []
    for(var prop in localStorage){
      // KEY_PREFIXから始まるkeyのみ取得
      if( new RegExp("^" + this.KEY_PREFIX).test(prop) ){
        keys.push(prop)
      }
    }
    this.articleKeys = keys;
  },
  // index ... key
  createButton: function(item, index){
    // メニューにボタンを追加.
    var textNode = document.createTextNode(String(localStorage[index]).substr(0,15).replace(/<.*[>*]/,""));
    var btn = document.createElement('button');
    var li = document.createElement('li')

    li.appendChild(btn);
    btn.appendChild(textNode);

    var dataKey = index;
    btn.setAttribute('data-key', dataKey);
    btn.setAttribute('class', 'btn_switch');
    document.getElementById('menu').appendChild(li);

    btn.addEventListener('click', this.switchText.bind(this, dataKey));

    var deleteBtn = document.createElement('button')
    deleteBtn.appendChild(document.createTextNode('delete'));
    deleteBtn.setAttribute('data-key', dataKey);
    deleteBtn.setAttribute('class', 'btn_delete');
    li.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', this.deleteText.bind(this, dataKey))
  },

  // 以下エディターの操作
  switchEdittingKey: function(key){
    this.edittingKey = key
    this.showCurrentArticleKey()
    localStorage.setItem("edittingKey", this.edittingKey);
  },
  switchText: function(key){
    this.switchEdittingKey(key)
    this.editableArea.innerHTML = localStorage[key]
    this.editableArea.focus()
  },
  deleteText(key){
    if( confirm('削除しておｋ?') ){
      delete localStorage[key]
      this.makeMenu();
      this.switchText(this.articleKeys[0]);
    }
  },


  saveToServer: function(){
    // いずれrailsに送る
    // keyupで送ると通信がパンクするのでintervalおいてセーブする
  },
  showWitchKeyIsPressed: function(){
    // 取得したkeyCodeを元にショートカットを定義づける(いずれ)
    this.editableArea.addEventListener('keypress', function(e){ console.log(e.keyCode) })
  },

}
