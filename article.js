var Article = function(args){
  this.title = args.title
  this.body = args.body
}

Article.prototype = {
  run: function(){
    console.log('init article')
  },
  toJSON: function(){
    return "{title: \"" + this.title + "\", body: \"" + this.body + "\"}"
  },
  toArticle: function(){

  },
  getArticle: function(arti){

  },
  setArticle: function(){

  }
}
