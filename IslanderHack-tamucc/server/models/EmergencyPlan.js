const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmergencyPlan = sequelize.define('EmergencyPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // User Information
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Firebase user ID or authentication identifier'
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Location Information
  zipCode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 10]
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  
  // Household Information
  adults: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  kids: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  elderly: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  pets: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  petDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Details about pets (type, size, special needs)'
  },
  
  // Medical Information
  hasMedicalNeeds: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  medicalNeeds: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of medical needs (oxygen, dialysis, insulin, etc.)'
  },
  medications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'List of required medications'
  },
  specialNeeds: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mobility assistance, dietary restrictions, etc.'
  },
  
  // Transportation
  hasVehicle: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'car, truck, van, etc.'
  },
  transportationNeeds: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Special transportation requirements'
  },
  
  // Emergency Contacts
  emergencyContacts: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of emergency contact objects {name, phone, relationship}'
  },
  
  // Evacuation Preferences
  preferredSafeZones: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of preferred safe zone IDs'
  },
  evacuationRoute: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Saved evacuation route data'
  },
  
  // Supplies Checklist
  suppliesChecklist: {
    type: DataTypes.JSON,
    defaultValue: {
      water: false,
      food: false,
      firstAid: false,
      flashlight: false,
      radio: false,
      batteries: false,
      medications: false,
      documents: false,
      cash: false,
      clothing: false,
      petSupplies: false,
      phoneCharger: false
    },
    comment: 'Checklist of emergency supplies'
  },
  
  // Plan Completion Status
  isComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  // Notifications Preferences
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notificationMethod: {
    type: DataTypes.JSON,
    defaultValue: {
      sms: false,
      email: true,
      push: true
    }
  },
  
  // Metadata
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes or special instructions'
  }
}, {
  tableName: 'emergency_plans',
  timestamps: true, // Adds createdAt and updatedAt automatically
  indexes: [
    {
      name: 'user_id_index',
      fields: ['userId']
    },
    {
      name: 'zip_code_index',
      fields: ['zipCode']
    }
  ],
  hooks: {
    beforeSave: (plan) => {
      // Update lastUpdated timestamp
      plan.lastUpdated = new Date();
      
      // Calculate completion percentage based on filled fields
      let totalFields = 10;
      let filledFields = 0;
      
      if (plan.zipCode) filledFields++;
      if (plan.adults > 0) filledFields++;
      if (plan.emergencyContacts && plan.emergencyContacts.length > 0) filledFields++;
      if (plan.hasVehicle !== null) filledFields++;
      if (plan.suppliesChecklist) {
        const checkedItems = Object.values(plan.suppliesChecklist).filter(Boolean).length;
        if (checkedItems > 0) filledFields++;
      }
      if (plan.preferredSafeZones && plan.preferredSafeZones.length > 0) filledFields++;
      if (plan.notificationsEnabled !== null) filledFields++;
      if (plan.medicalNeeds && plan.medicalNeeds.length > 0) filledFields++;
      if (plan.evacuationRoute) filledFields++;
      if (plan.emergencyContacts && plan.emergencyContacts.length >= 2) filledFields++;
      
      plan.completionPercentage = Math.round((filledFields / totalFields) * 100);
      plan.isComplete = plan.completionPercentage >= 80;
    }
  }
});

module.exports = EmergencyPlan;
