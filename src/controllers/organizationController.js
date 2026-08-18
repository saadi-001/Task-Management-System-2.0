const organizationService = require("../services/organizationService");


// ==============================
// Create Organization
// ==============================
const createOrganization = async (req, res) => {
    try {
        const {
            name,
            email,
            contactNo,
            logo,
            theme,
            ownerID
        } = req.body;

        const organization =
            await organizationService.createOrganization({
                name,
                email,
                contactNo,
                logo,
                theme,
                ownerID
            });

        res.status(201).json({
            success: true,
            message: "Organization created successfully",
            data: organization
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create organization"
        });
    }
};


// ==============================
// Get All Organizations
// ==============================
const getOrganizations = async (req, res) => {
    try {
        const organizations =
            await organizationService.getOrganizations();

        res.status(200).json({
            success: true,
            data: organizations
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch organizations"
        });
    }
};


// ==============================
// Get Organization By ID
// ==============================
const getOrganizationById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const organization =
            await organizationService.getOrganizationById(id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        res.status(200).json({
            success: true,
            data: organization
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch organization"
        });
    }
};


// ==============================
// Update Organization
// ==============================
const updateOrganization = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            email,
            contactNo,
            logo,
            theme
        } = req.body;

        const organization =
            await organizationService.updateOrganization(
                id,
                {
                    name,
                    email,
                    contactNo,
                    logo,
                    theme
                }
            );

        res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            data: organization
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update organization"
        });
    }
};


// ==============================
// Delete Organization
// ==============================
const deleteOrganization = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await organizationService.deleteOrganization(id);

        res.status(200).json({
            success: true,
            message: "Organization deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete organization"
        });
    }
};


// ==============================
// Assign User To Organization
// ==============================
const assignUserToOrganization = async (req, res) => {
    try {
        const {
            organizationId,
            userId,
            role
        } = req.body;

        const result =
            await organizationService.assignUserToOrganization(
                organizationId,
                userId,
                role
            );

        res.status(201).json({
            success: true,
            message: "User assigned to organization successfully",
            data: result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to assign user to organization"
        });
    }
};


// ==============================
// Remove User From Organization
// ==============================
const removeUserFromOrganization = async (req, res) => {
    try {
        const {
            organizationId,
            userId
        } = req.body;

        const result =
            await organizationService.removeUserFromOrganization(
                organizationId,
                userId
            );

        if (result.count === 0) {
            return res.status(404).json({
                success: false,
                message: "User is not a member of this organization"
            });
        }

        res.status(200).json({
            success: true,
            message: "User removed from organization successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to remove user from organization"
        });
    }
};


// ==============================
// Transfer Organization Owner
// ==============================
const transferOrganizationOwner = async (req, res) => {
    try {
        const {
            organizationId,
            newOwnerId
        } = req.body;

        const organization =
            await organizationService.transferOrganizationOwner(
                organizationId,
                newOwnerId
            );

        res.status(200).json({
            success: true,
            message: "Organization owner transferred successfully",
            data: organization
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to transfer organization owner"
        });
    }
};


// ==============================
// Export
// ==============================
module.exports = {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    assignUserToOrganization,
    removeUserFromOrganization,
    transferOrganizationOwner
};