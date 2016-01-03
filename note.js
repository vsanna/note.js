/*
# javascriptライブラリの練習

1. 指定したDOMを編集可能(contentEditable)にする
2. 押下したkeyCodeをconsoleに流す
3. localStorageへの保存と読み出し
4. 初期読み出しができる. また、初期読み出しにおいて直前に編集していたテキストを読み出せる
4. 2を元にショートカットを表示
*/

// 書き方1 クロージャーにしたうえでconstructorを返す
// var TestModule = (function(){
//   var constructor = function(config){
//     this.selector = config.selector
//   }
//
//   constructor.prototype.run = function(){
//     findEditableArea.call(this)
//     makeEditableArea.call(this)
//     showWitchKeyIsPressing.call(this)
//   }
//
//   var findEditableArea = function(){
//     this.editableArea = document.querySelector(this.selector)
//     console.log(this)
//   }
//   var makeEditableArea = function(){
//     this.editableArea.contentEditable = true
//   }
//
//   ... 一部省略
//
//   var showWitchKeyIsPressing = function(){
//     this.editableArea.addEventListener('keypress', function(e){ console.log(e.keyCode) })
//   }
//
//   return constructor
// })()


// 書き方2 オーソドックス.
var Note = function(config){
  this.MAX_ARTICLE_NUM = 20;
  this.KEY_PREFIX = (config.prefix) ? config.prefix : 'Note';
  this.selector = (config.selector) ? config.selector : '#main';
  this.edittingKey = (localStorage.edittingKey) ? localStorage.edittingKey : undefined;
  this.articleKeys = [];


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
    // このthisはrunを呼び出したインスタンス

    // 書き方1
    // インスタンスは直接はこのメソッドを持たないため、this.__proto__(==TestModule.prototype)を見に行っている.
    // なお、呼び出した関数内でのthisは関数呼び出しを行ったインスタンスそのものなので問題なし
    this.findEditableArea();
    this.makeEditableArea();
    this.makeEditableAreaFocus();
    this.makeMenu();
    this.readInitText();
    this.makeButtonToCreateNewArticle();
    this.makeButtonToSave();

    this.showWitchKeyIsPressed();
    // this.renderMD();

    // 書き方2
    // this.__proto__を明示的に書いたもの. 普段使いしない
    // this.__proto__は、継承元.prototypeへの暗黙のリンク
    // 呼び出しがTestModule.prototypeになってしまっているので, call(this)をして、ここでのthis = runを実行したインスタンスをbindしている
    // TestModule.prototype.findEditableArea.call(this); // TestModule.prototype.findEditableArea()は当然エラー
    // TestModule.prototype.makeEditableArea.call(this);
    // TestModule.prototype.showWitchKeyIsPressing.call(this);

    // 書き方3
    // もちろんこんな書き方はしない
    // この時、関数を呼び出しているのが、this.__proto__(===TestModule)であるため、よびだした関数内でのthisがインスタンスを示さない。
    // よって、ここでのthis = runを実行したインスタンスをcallでbindしている
    // this.__proto__.findEditableArea.call(this);
    // this.__proto__.makeEditableArea.call(this);
    // this.__proto__.showWitchKeyIsPressing.call(this);
  },
  findEditableArea: function(){
    console.log(this.selector)
    this.editableArea = document.querySelector(this.selector)
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
      this.createButton(this.articleKeys[index], this.articleKeys[index].replace(replaceTarget,''));
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
    }).bind(this)) // bind(this)することで、イベント付与時に、thisがDOM要素になることを回避!非常に便利
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
  createButton: function(item, index){
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

    // ボタンにイベント付与
    btn.addEventListener('click', this.switchText.bind(this, dataKey));
    // call, applyは関数の『実行』
    // bindは関数内のthisと引数を固定した関数を返す
    // method.bind(thisの指すobj, param1, ...)

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
