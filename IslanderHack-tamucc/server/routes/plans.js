const express = require('express');
const router = express.Router();
const EmergencyPlan = require('../models/EmergencyPlan');
const { Op } = require('sequelize');

// CREATE - Save new emergency plan
router.post('/', async (req, res) => {
  try {
    const plan = await EmergencyPlan.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Emergency plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency plan',
      error: error.message
    });
  }
});

// READ - Get all plans for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const plans = await EmergencyPlan.findAll({
      where: { userId: req.params.userId },
      order: [['updatedAt', 'DESC']]
    });
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

// READ - Get single plan by ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await EmergencyPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan',
      error: error.message
    });
  }
});

// READ - Search plans by zip code
router.get('/search/zipcode/:zipCode', async (req, res) => {
  try {
    const plans = await EmergencyPlan.findAll({
      where: { 
        zipCode: {
          [Op.like]: `${req.params.zipCode}%`
        }
      },
      order: [['updatedAt', 'DESC']]
    });
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Error searching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search plans',
      error: error.message
    });
  }
});

// UPDATE - Update existing plan
router.put('/:id', async (req, res) => {
  try {
    const plan = await EmergencyPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    await plan.update(req.body);
    
    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message
    });
  }
});

// PATCH - Partial update of plan
router.patch('/:id', async (req, res) => {
  try {
    const plan = await EmergencyPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    await plan.update(req.body);
    
    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message
    });
  }
});

// PATCH - Update supplies checklist
router.patch('/:id/supplies', async (req, res) => {
  try {
    const plan = await EmergencyPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    await plan.update({
      suppliesChecklist: {
        ...plan.suppliesChecklist,
        ...req.body
      }
    });
    
    res.json({
      success: true,
      message: 'Supplies checklist updated',
      data: plan
    });
  } catch (error) {
    console.error('Error updating supplies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplies',
      error: error.message
    });
  }
});

// PATCH - Update emergency contacts
router.patch('/:id/contacts', async (req, res) => {
  try {
    const plan = await EmergencyPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    await plan.update({
      emergencyContacts: req.body.contacts || req.body
    });
    
    res.json({
      success: true,
      message: 'Emergency contacts updated',
      data: plan
    });
  } catch (error) {
    console.error('Error updating contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contacts',
      error: error.message
    });
  }
});

// DELETE - Delete a plan
router.delete('/:id', async (req, res) => {
  try {
    const plan = await EmergencyPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    await plan.destroy();
    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message
    });
  }
});

// GET - Statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const plans = await EmergencyPlan.findAll({
      where: { userId: req.params.userId }
    });
    
    const stats = {
      totalPlans: plans.length,
      completePlans: plans.filter(p => p.isComplete).length,
      incompletePlans: plans.filter(p => !p.isComplete).length,
      averageCompletion: plans.length > 0 
        ? Math.round(plans.reduce((sum, p) => sum + p.completionPercentage, 0) / plans.length)
        : 0,
      lastUpdated: plans.length > 0 
        ? plans.reduce((latest, p) => p.updatedAt > latest ? p.updatedAt : latest, plans[0].updatedAt)
        : null
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
