// document.ready used to ensure that everything is all set before running
$(document).ready(function () {
  // require GoJS to use their methods for the family tree
  var create = go.GraphObject.make;

  // date picker setup
  var date_input = $('input[name="date"]'); //our date input has the name "date"
  var container =
    $(".bootstrap-iso form").length > 0
      ? $(".bootstrap-iso form").parent()
      : "body";
  var options = {
    format: "mm/dd/yyyy",
    container: container,
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options);

  // define Converters to be used for Bindings
  function genderBrushConverter(gender) {
    // if gender is male, return blue color
    if (gender === "male") return "#87CEFA";
    // if gender is female, return pink color
    if (gender === "female") return "#FFE4E1";
    // if gender is other, return green color
    return "#8FBC8F";
  }

  // On page load, display the family tree if there is one.
  function displayTree() {
    // If a diagram for the family tree already exists, clear it out before updating.
    var projectDiagram = go.Diagram.fromDiv("familyTreeContainer");
    if(projectDiagram){
          projectDiagram.div = null;
    }
    // Run get request to get the entire family tree
    $.ajax({
      url: "/api/family",
      method: "GET",
    })
      // After get request is successful, display the data in a tree format.
      .then((response) => {
        // create variable familyArray as an empty array to hold the information that will be pushed 
        var familyArray = [];

        // After get request is successful, display the data in a tree format.
        // create a for loop to iterate through the array
        for (var i = 0; i < response.length; i++) {
          // get each person in household
          var person = response[i];
          // define familyMember object.
          // Each node in the tree has 3-4 main properties, name, key(id), gender(node color), and parent(defines links between nodes)
          var familyMember = {
            name: person.fullName,
            key: person.id,
            gender: person.gender,
          };
          // ensure that individual's node is linked to the correct parent node using the parentId.
          if (person.Parent) {
            familyMember.parent = person.Parent.parent1ID;
          }
          // push information into the familyArray
          familyArray.push(familyMember);
        }

        // create variable familyTree to use GoJS's create method for creating the family tree
        var familyTree = create(go.Diagram, "familyTreeContainer", 
        {
          allowCopy: false,
            layout:  // create a TreeLayout for the family tree with these specifications
              create(go.TreeLayout,
                { angle: 90, nodeSpacing: 10, layerSpacing: 40, layerStyle: go.TreeLayout.LayerUniform })
        });

        // calling GoJS's nodeTemplate to utilize their create method to create aspects of the family tree
        familyTree.nodeTemplate = create(
          // calls on the Node class in the GoJS library to create nodes automatically
          go.Node,
          "Auto",
          // nodes cannot be deleted
          { deletable: false},
          // attach a text file so that each node can have a name
          new go.Binding("text", "name"),

          // calls on the Shape class to define the visual characteristics of each node
          create(
            go.Shape,
            // nodes will be a rectangle
            "Rectangle",
            {
              fill: "#E0F5F5",
              stroke: null,
              strokeWidth: 0,
              stretch: go.GraphObject.Fill,
              alignment: go.Spot.Center,
            },
            // fill rectangle based on information received in genderBrushConverter
            new go.Binding("fill", "gender", genderBrushConverter)
          ),
          // uses GoJS's create method to create hyperlinks on the text on each node
          create("HyperlinkText",
          // directs user to each node's individual member page
          function(node) { return "/member/" + node.data.key; },
          function(node) { return node.data.name; },
          { margin: 10,
            font: "700 16px Karla, sans-serif" 
          }
          )
        );

        // define the Link template (lines between nodes) using GoJS's create method
        familyTree.linkTemplate = create(
          go.Link, // the whole link panel
          { routing: go.Link.Orthogonal, corner: 5, selectable: false },
          create(go.Shape, { strokeWidth: 3, stroke: "#424242" })
        ); 

        // Create a treeModel to define the format of the created tree
        var treeModel = create(go.TreeModel);
        // create the family tree with information from the familyArray
        treeModel.nodeDataArray = familyArray;
        // Assign the created model to the tree.
        familyTree.model = treeModel;
      });
  }

  // when startButton is clicked, display form
  $("#startButton").on("click", function (event) {
    document.getElementById("startForm").style.display = "initial";
  });

  // Create on click event for form submit button
  $("#addButton").on("click", function (event) {
    // prevent page from reloading
    event.preventDefault();
    // get value of gender input
    var gender = $("input[name='gridRadios']:checked").val();

    // define object firstChild
    var firstChild = {
      fullName: $("#full-name").val(),
      gender: gender,
      dob: $("#dob").val(),
    };
    // define object firstParent
    var firstParent = {
      parent1: $("#full-name").val(),
      parent2: $("#partner").val(),
    };

    // Grab data from form and send post request to database
    // Post to both Parent and Child tables 
    $.post("/api/children", firstChild)
      // if successful, match based on the parentId to ensure the correct relationship from node to parent
      .then((response) => {
        firstParent.parent1ID = response.id;
        return $.post("/api/parents", firstParent);
      })
      .then((response) => {
        // display tree
      })
      .catch((error) => console.log(error));


    // Hide form 
    document.getElementById("startForm").style.display = "none";
    // Clear out form inputs
    $("#full-name").val('');
    $("input[name='gridRadios']:checked").prop("checked", false);
    $("#dob").val('');
    $("#partner").val('');
    // Update tree diagram
    displayTree();
  });
  displayTree();
});

