// Wait for document to be ready before running code
$(document).ready(function () {
  // Grab url of this page, and store the member's id for the current route
  const url = window.location.href.split('/');
  const memberId = url[url.length - 1];
  // Variable to hold the id for this member's entry in the Parent table
  var parentID;

  // Code to make the 'dob' input into a DatePicker for better entering of dates
  var date_input = $('input[name="date"]'); //our date input has the name "date"
  var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
  var options = {
    format: 'mm/dd/yyyy',
    container: container,
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options);

  // Function that displays this family member's information
  function showMember(){
    // Clears out the div before updating with data.
    var data = $("#member-data").empty();

    // Run the get route to grab this member's information from the Child table.
    $.get(`/api/children/${memberId}`)
    .then(response => {
      // After receiving a response, populate the page with this family member's information.
      // Fills in the header with their full name, as entered into the database
      $("#member-name").text(response.fullName);
      // Displays their gender, and capitalizes the first letter
      var gender = $("<li>").text(`Gender: ${response.gender.substr(0,1).toUpperCase()+response.gender.substr(1)}`);
      // Displays their date of birth, the toDateString transforms the date object into a string with format (day of week) Month DD YYYY
      var dob = $("<li>").text(`Date of Birth: ${new Date(response.dob).toDateString()}`);
      // Add the gender and dob elements to the div for the member info
      data.append(gender, dob);
      // Use promise chaining to call the api route to get this member's household (partner and children)
      return $.get(`/api/household/${memberId}`);
    })
    .then(response => {
      // Store this member's id for the Parent table
      parentID = response.id;
      // If this member has a partner, display the partner in another element
      if(response.parent2){
        // Add this member's partner to the info div
        data.append($("<li>").text(`Partner: ${response.parent2}`))
      }
      // If this member has children, display their names with a link to each child's page.
      if(response.Children.length > 0){
        // Create element to hold each child's name
        var children = $("<li>").text("Children: ");
        response.Children.forEach(child => {
        // For each child, create an anchor tag with a link to each of their pages
        var childPageLink = $(`<a href= '/member/${child.id}'>`).text(`${child.fullName}, `);
        // Add each anchor tag to the element holding the list of children
          children.append(childPageLink);
        });
        data.append(children);
      }
    })
    .catch(error => console.log(error));
  }

  // When the button on the "add a child" form is clicked, goes through and adds that new child to the database.
  $("#child-submit-btn").on("click", event => {

    // Create body object to send with post request by grabbing inputs from the form.
    var newChild = {
      fullName: $("#child-name").val(),
      gender: $("input[name='gender']:checked").val(),
      dob: $("#child-dob").val(),
      // ParentId of this new child should be the parentID for this page
      ParentId: parentID
    };
    // Call the route to add this new child to the Child table
    $.post("/api/children", newChild)
    .then(response => {
      // If we've successfully added a child, now we need to add this new member to the Parent table so that they can have a partner/children added to them later.
      var parentEntry = {
        parent1: $("#child-name").val(),
        // The parent1ID should link to the child's entry in the Child table
        parent1ID: response.id
      }
      // Empty out input fields on success
      $("#child-name").val('');
      $("input[name='gender']:checked").prop('checked', false);
      $("#child-dob").val('');
      // Use promise chaining to call the route to create an entry for this child in the Parent table.
      return $.post("/api/parents", parentEntry)
    })
    .then(response => {
      // After successfully adding, refresh the information to show the new child
      showMember();
    })
    .catch(err => console.log(err));
  })

  $("#partner-submit-btn").on("click", event => {
    // Create body object to send with post request
    var newPartner = {
      parent2: $("#partner-name").val()
    };
    // Call route to update the entry in the Parent table
    $.ajax({
      url: `/api/parents/${memberId}`,
      type: 'PUT',
      data: newPartner
   })
    .then(response => {
      // On success, refresh information on the page.
      $("#partner-name").val('');
      showMember();
    })
    .catch(err => console.log(err));
  })

  // On page load, display the information for this family member.
  showMember();
});