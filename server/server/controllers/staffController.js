const Staff = require('../models/Staff');

// GET /staff
exports.getAllStaff = async (req, res) => {
    try {
        const employees = await Staff.find();
        res.status(200).json({
            staffMembers: employees
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Error while retrieving staff!'
        });
    }
};

// GET /staff/:staffID
exports.getStaffById = async (req, res) => {
    try {
        const employeeId = req.params.staffID;
        const employee = await Staff.findById(employeeId);

        if(!employee) {
            return res.status(404).jso({
                message: '🍎 Staff not found!'
            });
        }

        res.status(200).json({
            staffMember: employee
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while retrieving staff member',
            error: err.message
        });
    }
};

// POST /staff/
exports.createStaffMember = async (req, res) => {
    try {
        const employee = new Staff(req.body);
        await employee.save();
        res.status(201).json({
            message: '🍏 Staff member was successfully created!',
            staffMember: employee
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// PUT /staff/:staffID
exports.updateStaffMember = async (req, res) => {
    try {
        const employeeId = req.params.staffID;
        const updatedEmployeeData = req.body;
        const updatedEmployee = await Staff.findByIdAndUpdate(employeeId, updatedEmployeeData, {
            new: true,
            runValidators: true,
        });

        if(!updatedEmployee) {
            return res.status(404).json({
                message: '🍎 Staff member not found'
            });
        }

        res.status(200).json({
            message: '🍏 Staff member updated successfully!',
            staffMember: updatedEmployee
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// DELETE /staff/:staffID
exports.deleteStaffMember = async (req, res) => {
    try {
        const employeeId = req.params.staffID;
        const deletedEmployee = await Staff.findByIdAndDelete(employeeId);

        if(!deletedEmployee) {
            return res.status(404).json({
                message: '🍎 Staff member not found'
            });
        }

        await deletedEmployee.deleteOne();

        res.status(200).json({
            message: '🍏 Staff member deleted successfully!',
            staffMember: deletedEmployee
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while deleting staff member',
            error: err.message
        });
    }
};