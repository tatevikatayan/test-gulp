let project__folder = require("path").basename(__dirname);
let source__folder = '#src';
let fs = require('fs');

let path = {
  build: {
    html: project__folder + '/',
    css: project__folder + '/css/',
    js: project__folder + '/js/',
    images: project__folder + '/images/',
    fonts: project__folder + '/fonts/',
  },
  src: {
    html: [source__folder + '/*.html', '!' + source__folder + '/_*.html'],
    css: source__folder + '/scss/style.scss',
    js: source__folder + '/js/script.js',
    images: source__folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: source__folder + '/fonts/*.ttf',
  },
  watch: {
    html: source__folder + '/**/*.html',
    css: source__folder + '/scss/**/*..scss',
    js: source__folder + '/js/**/*.js',
    images: source__folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
  },
  clean: './' + project__folder + '/',
};
let {src, dest} = require ('gulp'),
  gulp = require ('gulp'),
  browsersync = require ('browser-sync').create (),
  fileinclude = require ('gulp-file-include'),
  del = require ('del'),
  scss = require ('gulp-sass'),
  autoprefixer = require ('gulp-autoprefixer'),
  group_media = require ('gulp-group-css-media-queries'),
  clean_css = require ('gulp-clean-css'),
  rename = require ('gulp-rename'),
  uglify = require ('gulp-uglify-es').default,
  imagemin = require ('gulp-imagemin'),
  webp = require ('gulp-webp'),
  webphtml = require ('gulp-webp-html'),
  webpcss = require ('gulp-webpcss'),
  svgsprite = require ('gulp-svg-sprite'),
  ttf2woff = require ('gulp-ttf2woff'),
  ttf2woff2 = require ('gulp-ttf2woff2'),
  fonter = require ('gulp-fonter');

function browserSync () {
  browsersync.init ({
    server: {
      baseDir: './' + project__folder + '/',
    },
    port: 3000,
    notify: false,
  });
}

function html () {
  return src (path.src.html)
    .pipe (fileinclude ())
    .pipe(webphtml())
    .pipe (dest(path.build.html))
    .pipe (browsersync.stream ());
}

function css () {
  return src (path.src.css)
    .pipe (
      scss ({
        outputStyle: 'expanded',
      })
    )
    .pipe (group_media ())
    .pipe (
      autoprefixer ({
        overrideBrowserlist: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe(webpcss())
    .pipe (dest(path.build.css))
    .pipe (clean_css ())
    .pipe (
      rename ({
        extname: '.min.css',
      })
    )
    .pipe (dest(path.build.css))
    .pipe (browsersync.stream ());
}

function js () {
  return src(path.src.js)
    .pipe (fileinclude ())
    .pipe (dest(path.build.js))
    .pipe(
        uglify()
    )
    .pipe (
      rename ({
        extname: '.min.js',
      })
    )
    .pipe (dest(path.build.js))
    .pipe (browsersync.stream ());
}

function images () {
    return src (path.src.images)
    .pipe(
        webp({
           quality: 70
        })
    )
    .pipe (dest(path.build.images))
    .pipe(src(path.src.images))
    .pipe(
        imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        })
    )
      .pipe (dest(path.build.images))
      .pipe (browsersync.stream ());
}

function fonts(){
    src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
};

gulp.task('otf2ttf', function(){
    return src([source__folder + '/fonts/*.otf'])
    .pipe(fonter({
        formats: ['ttf']
    }))
    .pipe(dest(source__folder +'/fonts/'));
})

 gulp.task('svgsprite', function(){
     return gulp.src([source__folder + '/iconsprite/*.svg'])
     .pipe(svgsprite({
        mode: {
            stack: {
                sprite: "../icons/icons.svg",
                example: true
            }
        },
     }
     ))
     .pipe(dest(path.build.images))
 })

 function fontsStyle(){
  let file_content = fs.readFileSync(source__folder + '/scss/fonts.scss');
  if (file_content == '') {
  fs.writeFile(source__folder + '/scss/fonts.scss', '', cb);
  return fs.readdir(path.build.fonts, function (err, items) {
  if (items) {
  let c_fontname;
  for (var i = 0; i < items.length; i++) {
  let fontname = items[i].split('.');
  fontname = fontname[0];
  if (c_fontname != fontname) {
  fs.appendFile(source__folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
  }
  c_fontname = fontname;
  }
  }
  })
  }
}
 function cb(){

 }

function watchFiles () {
  gulp.watch ([path.watch.html], html);
  gulp.watch ([path.watch.css], css);
  gulp.watch ([path.watch.js], js);
  gulp.watch ([path.watch.images], images);
}

function clean () {
  return del (path.clean);
}

let build = gulp.series (clean, gulp.parallel (fontsStyle, fonts, images, js, css, html));
let watch = gulp.parallel (build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
