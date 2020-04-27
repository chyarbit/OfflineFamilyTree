module.exports = function(sequelize, DataTypes) {
    const Child = sequelize.define("Child", {
    // create a Child model
    // Child's full name
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Child's gender
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Child's date of birth
  dob: {
    type: DataTypes.DATE,
    allowNull: false
  }
})

// Creates a column ParentId in the Child table that is linked to the parent table 
Child.associate = function(models){
  Child.belongsTo(models.Parent,{
    foreignKey: {
      allowNull: true
    }
  });
}
return Child;
}