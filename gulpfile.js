'use strict';

var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var chalk = require('chalk');
var del = require('del');
var eslint = require('gulp-eslint');
var gulp = require('gulp');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var mocha = require('gulp-mocha');
var path = require('path');
var prettier = require('gulp-nf-prettier');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sassdoc = require('sassdoc');
var sasslint = require('gulp-sass-lint');
var sourcemaps = require('gulp-sourcemaps');
var svg = require('gulp-svg-symbols');
var uglify = require('gulp-uglify');

// Theme and project specific paths.
var paths = {
  DIST_DIR: 'dist/',
  SASS_DIR: 'scss/',
  IMG: 'assets/img/**/*',
  SVG: 'assets/svg/**/*.svg',
  JS_DIR: 'assets/js/',
  FONTS: 'assets/fonts/**/*',
  DOCS_DIR: 'sassdoc/',
  JS_TESTS_DIR: 'test/',
  TEMPLATES_DIR: 'templates/',
  IGNORE: ['!**/.#*', '!**/flycheck_*'],
  init: function() {
    this.TEMPLATES = [this.TEMPLATES_DIR + '**/*.j2'].concat(this.IGNORE);
    this.SASS = [this.SASS_DIR + '**/*.scss'].concat(this.IGNORE);
    this.JS = [this.JS_DIR + '**/*.js'].concat(this.IGNORE);
    this.SRC_JS = [this.JS_DIR + '**/*.js', 'lib/**/*.js', 'index.js'].concat(
      this.IGNORE
    );
    this.ALL_JS = [
      this.JS_DIR + '**/*.js',
      'lib/**/*.js',
      this.JS_TESTS_DIR + '**/*.js',
      'gulpfile.js',
      'index.js',
      '!assets/js/highlight.js',
      '!assets/js/jquery-3.1.1.slim.js'
    ].concat(this.IGNORE);
    this.JS_TESTS_FILES = [
      this.JS_TESTS_DIR + '**/*.js',
      this.JS_TESTS_DIR + '**/*.j2'
    ].concat(this.IGNORE);
    return this;
  }
}.init();

// Try to ensure that all processes are killed on exit
var spawned = [];
process.on('exit', function() {
  spawned.forEach(function(pcs) {
    pcs.kill();
  });
});

var onError = function(err) {
  gutil.log(chalk.red(err.message));
  gutil.beep();
  this.emit('end');
};

var eslintTask = function(src, failOnError, log) {
  if (log) {
    gutil.log('Running', "'" + chalk.cyan('eslint ' + src) + "'...");
  }
  var stream = gulp
    .src(src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  if (!failOnError) {
    stream.on('error', onError);
  }
  return stream;
};

var prettierTask = function(src, log) {
  if (log) {
    var cmd = 'prettier ' + src;
    gutil.log('Running', "'" + chalk.cyan(cmd) + "'...");
  }
  return gulp
    .src(src, { base: './' })
    .pipe(prettier({ singleQuote: true }))
    .pipe(gulp.dest('./'))
    .on('error', onError);
};

var sasslintTask = function(src, failOnError, log) {
  if (log) {
    gutil.log('Running', "'" + chalk.cyan('sasslint ' + src) + "'...");
  }
  var stream = gulp
    .src(src)
    .pipe(sasslint())
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError());
  if (!failOnError) {
    stream.on('error', onError);
  }
  return stream;
};

gulp.task('prettier', function() {
  return prettierTask(paths.ALL_JS);
});

gulp.task('eslint', ['prettier'], function() {
  return eslintTask(paths.ALL_JS, true);
});

gulp.task('eslint-nofail', function() {
  return eslintTask(paths.ALL_JS);
});

gulp.task('sasslint', function() {
  return sasslintTask(paths.SASS, true);
});

gulp.task('sasslint-nofail', function() {
  return sasslintTask(paths.SASS);
});

gulp.task('sass', function() {
  return gulp
    .src(paths.SASS)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .on('error', onError)
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.DIST_DIR + 'css/'));
});

// Need to finish compile before running tests,
// so that the processes do not conflict
gulp.task('test', ['compile'], function() {
  return gulp
    .src(paths.JS_TESTS_DIR + '**/*.js', { read: false })
    .pipe(mocha());
});

gulp.task('browser-sync', function(cb) {
  browserSync.init(
    {
      open: false,
      server: {
        baseDir: paths.DOCS_DIR
      },
      logLevel: 'info',
      logPrefix: 'herman',
      notify: false,
      ghostMode: false,
      files: [paths.DOCS_DIR + '**/*'],
      reloadDelay: 300,
      reloadThrottle: 500,
      // Because we're debouncing, we always want to reload the page to prevent
      // a case where the CSS change is detected first (and injected), and
      // subsequent JS/HTML changes are ignored.
      injectChanges: false
    },
    cb
  );
});

// SassDoc compilation.
// See: http://sassdoc.com/customising-the-view/
gulp.task('compile', ['sass', 'minify'], function() {
  var config = {
    verbose: true,
    dest: paths.DOCS_DIR,
    theme: './',
    herman: {
      subprojects: ['accoutrement-color'],
      templatepath: path.join(__dirname, 'templates'),
      sass: {
        jsonfile: './dist/css/json.css',
        includepaths: [path.join(__dirname, 'scss')],
        includes: ['utilities', 'config/manifest']
      }
    },
    display: {
      access: ['public'],
      alias: true
    },
    // Disable cache to enable live-reloading.
    // Usefull for some template engines (e.g. Swig).
    cache: false
  };

  return gulp
    .src(path.join(paths.SASS_DIR + '**/*.scss'))
    .pipe(sassdoc(config));
});

gulp.task('default', ['compile', 'eslint', 'sasslint', 'test']);

gulp.task('serve', ['dev', 'browser-sync']);

// Development task.
// While working on a theme.
gulp.task('dev', [
  'prettier',
  'eslint-nofail',
  'sasslint-nofail',
  'compile',
  'test',
  'watch'
]);

gulp.task('watch', function() {
  gulp.watch(
    [
      paths.SRC_JS,
      paths.SASS,
      paths.TEMPLATES,
      paths.IMG,
      paths.SVG,
      paths.FONTS,
      paths.TEMPLATES_DIR + '_icon_template.lodash',
      './README.md'
    ],
    ['compile']
  );

  gulp.watch([paths.JS, paths.JS_TESTS_FILES], ['test']);

  gulp.watch(paths.SASS, function(ev) {
    if (ev.type === 'added' || ev.type === 'changed') {
      sasslintTask(ev.path, false, true);
    }
  });

  gulp.watch(paths.ALL_JS, { debounceDelay: 1000 }, function(ev) {
    if (ev.type === 'added' || ev.type === 'changed') {
      prettierTask(ev.path, true).on('end', function() {
        eslintTask(ev.path, false, true);
      });
    }
  });

  gulp.watch('**/.sass-lint.yml', ['sasslint-nofail']);
  gulp.watch('**/.eslintrc.yml', ['eslint-nofail']);
});

gulp.task('copy-fonts', function() {
  var dest = paths.DIST_DIR + 'fonts/';

  return gulp.src(paths.FONTS).pipe(gulp.dest(dest));
});

gulp.task('jsmin', function() {
  var dest = paths.DIST_DIR + 'js/';

  return gulp
    .src(paths.JS_DIR + '**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(dest));
});

gulp.task('svg-clean', function(cb) {
  del(paths.TEMPLATES_DIR + '_icons.svg').then(function() {
    cb();
  });
});

gulp.task('svgmin', ['svg-clean'], function() {
  return gulp
    .src(paths.SVG)
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(
      svg({
        id: 'icon-%f',
        title: '%f icon',
        templates: [
          path.join(__dirname, paths.TEMPLATES_DIR, '_icon_template.lodash')
        ]
      })
    )
    .pipe(rename('_icons.svg'))
    .pipe(gulp.dest(paths.TEMPLATES_DIR));
});

gulp.task('imagemin', function() {
  var dest = paths.DIST_DIR + 'img/';

  return gulp
    .src(paths.IMG)
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.jpegtran(),
        imagemin.optipng(),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest(dest));
});

gulp.task('minify', ['jsmin', 'svgmin', 'imagemin', 'copy-fonts']);
