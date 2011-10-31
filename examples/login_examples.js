[
  new Test("As a user, I can connect and login", function() {
    //Given a user with username 'john_doe' and password 'password'
    
    this.visit('/', function() {
    this.wait_for_element('.message', 5000, function() {
    this.assert_present('.message', 'Connecting...');
    this.wait_for_element_removal('.message', 5000, function() {
    this.wait_for_element('.login_box', 5000, function() {
    this.fill_in('#login_username_field', 'john_doe');
    this.fill_in('#login_password_field', 'password');
    this.click_on('#login_submit_button');
    this.wait_for_element_removal('.login_box', 5000, function() {
    this.assert_present('#user_logout_button', 'Logout');
    
    this.end_test();
      
    });});});});});
  }),
  
  new Test("As a user, I try to connect with the wrong credentials", function () {
    this.visit('/', function() {
    this.wait_for_element('.login_box', 5000, function() {
    this.fill_in('#login_username_field', 'john_doe');
    this.fill_in('#login_password_field', 'the_wrong_password');
    this.click_on('#login_submit_button');
    this.wait_for_element('.error_messages p', 5000, function(){
    this.assert_present('.error_messages p', 'No user with that username and password.');
    this.end_test();

    });});});  
  })
];