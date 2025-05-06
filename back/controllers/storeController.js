const Store = require('../models/Store');
const User = require('../models/User');


exports.createStore = async (req, res) => {
  try {

    console.log("req.body",req.body)
    const { name, email, address, owner } = req.body;

    console.log("ownerId",owner)

    // Validate if the specified owner exists and is a storeOwner
    const ownerId = await User.findById(owner);
    if (!ownerId) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Create the store
    const store = await Store.create({
      name,
      email,
      address,
      owner: owner
    });

    // Update the user's role to storeOwner if not already
    if (owner.role !== 'storeOwner') {
      owner.role = 'storeOwner';
      await ownerId.save();
    }

    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({
      message: 'Store creation failed',
      error: error.message,
    });
  }
};

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find({})
      .populate('owner', 'name email')
      .sort({ name: 1 });
    
    res.json(stores);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch stores',
      error: error.message,
    });
  }
};


exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'ratings',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    if (store) {
      res.json(store);
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch store',
      error: error.message,
    });
  }
};


exports.updateStore = async (req, res) => {
  try {
    const { name, email, address } = req.body;

    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user is admin or the store owner
    if (req.user.role !== 'admin' && req.user._id.toString() !== store.owner.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    store.name = name || store.name;
    store.email = email || store.email;
    store.address = address || store.address;

    const updatedStore = await store.save();
    res.json(updatedStore);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update store',
      error: error.message,
    });
  }
};


exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    console.log("store",store)

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await Store.findByIdAndDelete(req.params.id);
    res.json({ message: 'Store removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete store',
      error: error.message,
    });
  }
};

// @desc    Get stores by owner
// @route   GET /api/stores/owner/:ownerId
// @access  Private
exports.getStoresByOwner = async (req, res) => {
  try {
    const stores = await Store.find({ owner: req.params.ownerId })
      .sort({ name: 1 });
    
    res.json(stores);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch stores by owner',
      error: error.message,
    });
  }
}; 