function DOMTest(example_files) {
  var test_feedback_element = $('#test_feedback');
  var test_fails_element = $('#test_fails');
  
  var tests = [];
  this.tests = tests;
  
  collect_examples();
  
  function collect_examples() {
    var remaining_example_files = example_files.length;

    for (var i in example_files) {
      $.post(example_files[i], function(response) {
        var example_group = eval(response);
        for (var i in example_group) {
          example_group[i].example_group = example_files[i];
          tests.push(example_group[i]);
        }
        remaining_example_files--;
        if (remaining_example_files == 0) {
          run_tests();
        }
      });
    }
  }
  
  function run_tests() {
    for (var i in tests) {
      tests[i].start_test();
    }
  }
  this.run_tests = run_tests;
  
  function handle_complete_example(test) {
    render_feedback(test);
  }
  
  function render_feedback(test) {
    if (test.passed) {
      test_feedback_element.append('<span class="pass">.</span>');
    }
    else {
      test_feedback_element.append('<span class="fail">F</span>');
      test_fails_element.append('<p class="fail spec_name">"'+test.name+'" in example group "'+test.example_group+'" failed' + "</p>");
      test_fails_element.append('<p class="fail error_message">'+test.failure_message + "</p>");
    }
  }
  
  function Test(name, test_func) {
    var self = this;
    var test_frame;
    this.width = 500;
    this.height = 500;
    this.name = name;
    this.test_func = test_func;
    this.passed = null;
    this.failure_message = null;
    this.example_group = null;
    this.document = null;


    this.start_test = function start_test() {
      test_frame = $('<iframe></iframe>');
      test_frame.css({width: this.width, height: this.height});
      $('body').append(test_frame);
      this.document = test_frame.contents()[0];
      this.test_func.apply(this);
    };

    this.end_test = function end_test() {
      if (this.passed !== false) {
        this.passed = true;
        tear_down();
        handle_complete_example(self);
      }
    };
    this.test_failed = function test_failed(message) {
      this.passed = false;
      this.failure_message = message;
      tear_down();
      handle_complete_example(self);
    };

    function tear_down() {
      test_frame.remove();
      delete(self.document);
    };
    function rebind_document() {
      self.document = test_frame.contents()[0];
    }

    this.visit = function visit(path, callback) {
      self.document.location = path;

      test_ready_state();
      
      function test_ready_state() {
        rebind_document();

        if (self.document.readyState == 'complete') {
          callback.apply(self);
        }
        else {
          setTimeout(test_ready_state, 50);
        }
      }
    };
    
    this.wait_for_element = function wait_for_element(selector, max_duration, callback) {
      test_presence();
      var start_time = new Date();
      
      function test_presence() {
        rebind_document();
        if ($(selector, self.document.body).length > 0) {
          callback.apply(self);
        }
        else if (new Date() - start_time > max_duration) {
          self.test_failed("Waited too long for element matching \""+selector+"\"");
        }
        else setTimeout(test_presence, 50);
      }
    };
    this.wait_for_element_removal = function wait_for_element_removal(selector, max_duration, callback) {
      test_presence();
      var start_time = new Date();
      
      function test_presence() {
        rebind_document();
        if ($(selector, self.document.body).length == 0) {
          callback.apply(self);
        }
        else if (new Date() - start_time > max_duration) {
          self.test_failed("Waited too long for element matching \""+selector+"\" to disappear.");
        }
        else setTimeout(test_presence, 50);
      }
    };
    
    this.assert_present = function assert_present(selector, content) {
      var match = $(selector, self.document.body);      
      if (match.length == 0) {
        self.test_failed("Expected to find an element matching \""+selector+"\"");
      }
      else if (content) {
        var match_includes_content = false;
        for (var i=0; i<match.length; i++) {
          if (match[i].innerHTML.indexOf(content) != -1) {
            match_includes_content = true;
            break;
          }
        }
        
        if (!match_includes_content) {
          self.test_failed('Found at least one element matching "'+selector+'", but none with the content "'+content+'"');
        }
      }
    };

    this.assert_equal = function assert_equal(a, b) {
      if (a != b) {
        self.test_failed("Expected "+a+" to equal "+b+", but didn't");
      }
    };
    
    this.fill_in = function fill_in(selector, value) {
      self.assert_present(selector);
      $(selector, self.document.body).val(value);
    };
    
    this.click_on = function click_on(selector) {
      self.assert_present(selector);
      $(selector, self.document.body).click();
    };
    
    this.login_as = function login_as(username, password, callback) {
      this.visit('/client.html', function() {
        this.wait_for_element('.login_box', 5000, function() {
          this.fill_in('#login_username_field', username);
          this.fill_in('#login_password_field', password);
          this.click_on('#login_submit_button');
          callback.apply(this);
        });
      });
    };
  }
  window.Test = Test;
}
