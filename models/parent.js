module.exports = function(sequelize, DataTypes) {
    const Parent = sequelize.define("Parent", {
    // create a Child model
  // main parent who has the entry in the table
  parent1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // used to link the child and parent nodes together for identification
  parent1ID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // partner/spouse
  parent2: DataTypes.STRING
})

Parent.associate = function(models){
    Parent.hasMany(models.Child,{
      onDelete: "cascade"
  });
}
return Parent;
}