/**
* @Date:   2017-01-17
* @Email:  550928460@qq.com
* @Last modified time: 2017-01-18
*/
var
  gulp = require('gulp')
  ,minimist = require('minimist')
  ,fs = require('fs')
  ,path = require('path')
  ,color = require('colors')
  ,rmdir = require('rmdir')
  ,sass = require('gulp-sass')
  ,rename = require('gulp-rename')
  ,glob = require('glob')
;

//目录配置
var
  app ={
    dir:'./wechat-gad'
  }
;



//命令行参数配置
var pageName = {
  string: 'name',
  default: { name: process.env.NODE_ENV || 'production' }
};

gulp.task('page',function(){
  var option = minimist(process.argv.slice(2), pageName);

  //判断参数是否为空
  if(!option.name){
    console.log('\nU need input a value with  --name option \n'.red);
      return false;
  }

  if(isDirExit(option.name)){
    console.log('\nPages exists! Choose another one! \n'.red);
    return;
  }

  var prefix = app.dir + '/pages/'+ option.name ;
  console.log(prefix);
  mkdirSync(prefix);
  fs.closeSync(fs.openSync(prefix + '/' + option.name + '.js', 'w'));
  fs.closeSync(fs.openSync(prefix + '/' + option.name + '.json', 'w'));
  fs.closeSync(fs.openSync(prefix + '/' + option.name + '.wxml', 'w'));
  fs.closeSync(fs.openSync(prefix + '/' + option.name + '.wxss', 'w'));

  fs.closeSync(fs.openSync('./page-scss/'+option.name + '.scss', 'w'));


})

gulp.task('rmpage',function(){
  var option = minimist(process.argv.slice(2), pageName);

  //判断参数是否为空
  if(!option.name){
    console.log('\nU need input a value with  --name option \n'.red);
      return false;
  }

  if(!isDirExit(option.name)){
    console.log('\nPages not exists!\n'.red);
    return;
  }

  rmdir(app.dir + '/pages/'+ option.name, function (err, dirs, files) {
    console.log(dirs);
    console.log(files);
    console.log('all files are removed'.red);
  });
})

//监听scss并编译到page中
var
  watcher = gulp.watch(['./page-scss/**'])
  ,fileNameReg = /.*page-scss\\([\w]+)\.scss/
;

gulp.task('pagescss',['scss'],function(){
  watcher.on('change',function(e){
    var fileName = e.path.match(fileNameReg)[1];

    if(!isDirExit(fileName)){
      console.log("Cann't compile sass in the Directory which doesn't exit!".red);
      return;
    }

    console.log(e.path + " has Changed! Recompile!");
    return gulp.src(e.path)
          .pipe(sass.sync().on('error', sass.logError))
          .pipe(rename(fileName + '.wxss'))
          .pipe(gulp.dest(app.dir + '/pages/'+fileName));
  });
});

//编译page-scss下所有的文件
gulp.task('scss',function(){
    var
      files = glob.sync('page-scss/*.scss')
      ,fileNameReg = /page-scss\/([\w]+).scss/
      ,streams
    ;

    streams = files.map(function(file) {

      var fileName = file.match(fileNameReg)[1];
      if(!isDirExit(fileName)){
        console.log(fileName + ' directory does exit!'.red);
        return;
      }
        return gulp.src(file)
                  .pipe(sass.sync().on('error', sass.logError))
                  .pipe(rename(fileName + '.wxss'))
                  .pipe(gulp.dest(app.dir + '/pages/'+fileName));

    });
    // return es.merge.apply(es, streams);

})

function isDirExit(name){

  //判断page是否存在
  var dirs = getDirectories(app.dir+'/pages');
  if(dirs.indexOf(name) == -1)
    return false;

  return true;
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

function mkdirSync(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}
