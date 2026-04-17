import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin,Manager
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let queryStr = JSON.stringify(req.query);
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    let queryObj = JSON.parse(queryStr);
    
    // Handle search by name or email
    if (req.query.search) {
      queryObj.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
      delete queryObj.search;
    }

    // Remove pagination fields from query
    delete queryObj.page;
    delete queryObj.limit;

    // Execute query
    let query = User.find(queryObj);

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    query = query.skip(startIndex).limit(limit);

    // Populate createdBy and updatedBy
    query = query.populate({ path: 'createdBy', select: 'name' })
                 .populate({ path: 'updatedBy', select: 'name' });

    const users = await query;
    const total = await User.countDocuments(queryObj);

    // Pagination result
    const pagination = {
      total,
      page,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin,Manager
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
      
    if (!user) {
      res.status(404);
      return next(new Error(`User not found with id of ${req.params.id}`));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    // Add user to req.body as creator
    req.body.createdBy = req.user.id;
    req.body.updatedBy = req.user.id;

    // Check email
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      res.status(400);
      return next(new Error('Email already exists'));
    }

    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin,Manager,User
export const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      return next(new Error(`User not found with id of ${req.params.id}`));
    }

    // Role-based logic
    if (req.user.role === 'user') {
      // User can only update their own profile, and cannot change role or status
      if (req.user.id !== user._id.toString()) {
        res.status(403);
        return next(new Error('Not authorized to update this user'));
      }
      delete req.body.role;
      delete req.body.status;
    } else if (req.user.role === 'manager') {
      // Manager cannot update an admin's role, or make someone an admin
      if (user.role === 'admin') {
        res.status(403);
        return next(new Error('Manager cannot update an admin user'));
      }
      if (req.body.role === 'admin') {
        res.status(403);
        return next(new Error('Manager cannot assign admin role'));
      }
    }

    req.body.updatedBy = req.user.id;

    // If password is in body, use save() instead of findByIdAndUpdate to trigger hook
    if (req.body.password) {
      user.password = req.body.password;
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.user.role !== 'user') Object.assign(user, req.body);
      await user.save();
    } else {
      user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      return next(new Error(`User not found with id of ${req.params.id}`));
    }

    // Soft delete / deactivate (as requested: "Soft delete or deactivate user")
    user.status = 'inactive';
    user.updatedBy = req.user.id;
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
