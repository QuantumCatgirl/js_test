[
  new Test('As a user I can see a stream with everything in it', function() {
    this.login_as('john_doe', 'password', function() {
      this.wait_for_element('#stream_manager', 5000, function() {
        $('#create_stream_field', this.document.body).click();
        this.assert_present('#stream_manager #stream_list li', 'All');
          
        this.end_test();
      });
    });
  })
];