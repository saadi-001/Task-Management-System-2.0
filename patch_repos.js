const fs = require('fs');
const path = require('path');

const targets = [
    {
        file: 'ticketRepository.js',
        functions: [
            {
                name: 'deleteTicket',
                tableName: 'task',
                modelName: 'task',
                regex: /(const deleteTicket = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.task\.delete\([\s\S]*?\}\);)(\s*\};)/
            }
        ]
    },
    {
        file: 'organizationRepository.js',
        functions: [
            {
                name: 'deleteOrganization',
                tableName: 'organization',
                modelName: 'organization',
                regex: /(const deleteOrganization = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.organization\.delete\([\s\S]*?\}\);)(\s*\};)/
            },
            {
                name: 'removeUserFromOrganization',
                tableName: 'organizationmembers',
                modelName: 'organizationmembers',
                regex: /(const removeUserFromOrganization = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.organizationmembers\.deleteMany\([\s\S]*?\}\);)(\s*\};)/
            }
        ]
    },
    {
        file: 'projectRepository.js',
        functions: [
            {
                name: 'deleteProject',
                tableName: 'project',
                modelName: 'project',
                regex: /(const deleteProject = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.project\.delete\([\s\S]*?\}\);)(\s*\};)/
            }
        ]
    },
    {
        file: 'attachmentRepository.js',
        functions: [
            {
                name: 'deleteAttachment',
                tableName: 'attachment',
                modelName: 'attachment',
                regex: /(const deleteAttachment = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.attachment\.delete\([\s\S]*?\}\);)(\s*\};)/
            }
        ]
    },
    {
        file: 'roleRepository.js',
        functions: [
            {
                name: 'deleteRole',
                tableName: 'role',
                modelName: 'role',
                regex: /(const deleteRole = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.role\.delete\([\s\S]*?\}\);)(\s*\};)/
            },
            {
                name: 'removePermissionFromRole',
                tableName: 'rolepermission',
                modelName: 'rolepermission',
                regex: /(const removePermissionFromRole = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.rolepermission\.deleteMany\([\s\S]*?\}\);)(\s*\};)/
            },
            {
                name: 'removeRoleFromUser',
                tableName: 'userrole',
                modelName: 'userrole',
                regex: /(const removeRoleFromUser = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.userrole\.deleteMany\([\s\S]*?\}\);)(\s*\};)/
            }
        ]
    },
    {
        file: 'permissionRepository.js',
        functions: [
            {
                name: 'deletePermission',
                tableName: 'permission',
                modelName: 'permission',
                regex: /(const deletePermission = async \([\s\S]*?\) => \{[\s\S]*?return )(await prisma\.permission\.delete\([\s\S]*?\}\);)(\s*\};)/
            }
        ]
    }
];

const basePath = 'backend/src/repositories';

targets.forEach(target => {
    const filePath = path.join(basePath, target.file);
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (!content.includes('resetAutoIncrementIfEmpty')) {
        content = content.replace(
            'const prisma = require("../config/prisma");',
            'const prisma = require("../config/prisma");\nconst { resetAutoIncrementIfEmpty } = require("../utils/resetAutoIncrement");'
        );
    }

    target.functions.forEach(func => {
        if (!content.includes(`resetAutoIncrementIfEmpty('${func.tableName}'`)) {
            if (func.regex.test(content)) {
                content = content.replace(func.regex, `$1(async () => {\n    const result = $2\n    await resetAutoIncrementIfEmpty('${func.tableName}', '${func.modelName}');\n    return result;\n  })()$3`);
                modified = true;
                console.log(`Patched ${func.name} in ${target.file}`);
            } else {
                console.error(`Regex failed for ${func.name} in ${target.file}`);
            }
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
console.log('Patching complete.');
