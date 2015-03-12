angular.module('schemaForm').directive('pickADate', function ( ) {

  //String dates for min and max is not supported
  //https://github.com/amsul/pickadate.js/issues/439
  //So strings we create dates from
  var formatDate = function(value) {
    //Strings or timestamps we make a date of
    if (angular.isString(value) || angular.isNumber(value)) {
      return new Date(value);
    }
    return value; //We hope it's a date object
  };

  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      ngModel: '=',
      minDate: '=',
      maxDate: '=',
      format: '=',
      pickADate: '='
    },
    link: function (scope, element, attrs, ngModel) { 
      //Bail out gracefully if pickadate is not loaded.
      
      var picker;
      var timeoutDeduplicate;
      var pickedElem;
      var runOnceUndone = true;
      var basicOptions = {
        onClose: function () {
          element.blur();
        },
        formatSubmit: null
      };

      var exec = function( externalOptions ){ 

      if (!element.pickadate ) {
        return;
      };



      if( !externalOptions || !externalOptions.constructor.name === "Object" ){

        if (angular.isDefined(attrs.pickADateOptions) && attrs.pickADateOptions.constructor.name === "Object") {
          externalOptions = attrs.pickADateOptions;  
        }else {
          externalOptions = {};
        };
      }


      var fullOptions = angular.extend({}, basicOptions, externalOptions );


      //By setting formatSubmit to null we inhibit the
      //hidden field that pickadate likes to create.
      //We use ngModel formatters instead to format the value.
      pickedElem = element.pickadate( fullOptions );

      //Defaultformat is for json schema date-time is ISO8601
      //i.e.  "yyyy-mm-dd"
      var defaultFormat = 'yyyy-mm-dd';

      //View format on the other hand we get from the pickadate translation file
      var viewFormat    = $.fn.pickadate.defaults.format;

      picker = element.pickadate('picker');

      // Some things have to run only once or they freeze the browser!
      if( runOnceUndone ){

        //The view value
        ngModel.$formatters.push(function(value) {
          if (angular.isUndefined(value) || value === null) {
            return value;
          }

        //We set 'view' and 'highlight' instead of 'select'
        //since the latter also changes the input, which we do not want.
        picker.set('view', value, {format: scope.format || defaultFormat});
        picker.set('highlight', value, {format: scope.format || defaultFormat});

        //piggy back on highlight to and let pickadate do the transformation.
        return picker.get('highlight', viewFormat);
      });

        ngModel.$parsers.push(function() {
          return picker.get('select', scope.format || defaultFormat);
        });

        runOnceUndone = false;
      };

    };



    

    //bind once.
    if (angular.isDefined(attrs.minDate)) {
      var onceMin = scope.$watch('minDate', function (value) {
        if ( value && picker ) {
          picker.set('min', formatDate(value));
          onceMin();
        }
      }, true);
    }

    if (angular.isDefined(attrs.maxDate)) {
      var onceMax = scope.$watch('maxDate', function (value) {
        if (value && picker) {
          picker.set('max', formatDate(value));
          onceMax();
        }
      }, true);
    }

    if (angular.isDefined(attrs.pickADate)) {
      var onceOptions = scope.$watch('pickADate', function (value) { 

        if( value && picker && value.constructor.name === "Object" ){

          picker.stop();
          clearTimeout( timeoutDeduplicate );
          timeoutDeduplicate = setTimeout(function() {
            exec( value );
          }, 1500);
          onceOptions();
        };
      }, true);
    };

    exec();
  }
};
});
