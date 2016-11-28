# JOWN Prototyping
J.O.W.N. - Just Our Workflow Notation

This is the prototyping repository for prototyping various behavior and learning the technologies in a *sandbox* environment for usage in the actual project codebase.

# Setup

**Prereq:** Node.js & NPM are installed and are added to the path.

You should have access to some bash terminal for the following commands. 

Clone the Git repository. 
```
git clone git@github.com:arpitshah101/JOWN.git
```

Install the following global dependencies:  
```
npm install -g bower gulp typescript tslint typings
```

Install all the local npm dependencies. 
```
npm install
```

Install all the type definitions for TypeScript. 
```
typings install
```


## Technologies Used so far
1. TypeScript
    * For backend code to provide typechecking despite ultimately being compiled to JavaScript.
2. Gulp
    * Task automation
    * Used to automate build from *src* folder to *dest* folder with compiled JavaScript 
3. Mongoose
    * ORM (Object Relational Mapping) for models to be saved into MongoDB (and provides query language)
4. Mocha --> Chai
    * Automated test framework for JavaScript
    * To be used on backend for sure
    * Possibly used for automated tests on the web components provided as a part of the Polymer Element Catalog

## Links
https://anotheruiguy.gitbooks.io/nodeexpreslibsass_from-scratch/content/gulp.html
https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-mocha
https://www.mikestreety.co.uk/blog/advanced-gulp-file

## Contributors
1. Arpit Shah
2. Jon Getahun
3. Baltsar Hesslow
4. Xi Chen