const fs = require('fs');
const path = require('path');
const https = require('https');

const outputPath = path.join(__dirname, '..', 'DATABASE_MAP.md');
const supabaseUrl = "https://osfnqpehvhznrecljjjf.supabase.co/rest/v1/";
const apiKey = "sb_secret_K-rLyPMRkuWLfIsvJ9oolQ_aTnBECiy";

const options = {
    headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
    }
};

https.get(supabaseUrl, options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const schema = JSON.parse(data);
            let markdown = '# 🗺️ Mapa do Banco de Dados (Supabase)\n\n';
            markdown += 'Este documento contém o mapeamento de tabelas, colunas e tipos do projeto Ticketera.\n\n';

            const definitions = schema.definitions || {};
            const tables = Object.keys(definitions).sort();

            tables.forEach(tableName => {
                const table = definitions[tableName];
                markdown += `## 📋 Tabela: \`${tableName}\`\n`;
                if (table.description) {
                    markdown += `> ${table.description}\n\n`;
                }

                markdown += '| Coluna | Tipo | Obrigatório | Descrição |\n';
                markdown += '| :--- | :--- | :---: | :--- |\n';

                const properties = table.properties || {};
                const required = table.required || [];

                Object.keys(properties).forEach(colName => {
                    const prop = properties[colName];
                    const isRequired = required.includes(colName) ? '✅' : '❌';
                    const type = prop.type === 'array' ? `${prop.items.type}[]` : prop.format || prop.type;
                    const description = prop.description || '-';

                    markdown += `| \`${colName}\` | \`${type}\` | ${isRequired} | ${description} |\n`;
                });

                markdown += '\n---\n\n';
            });

            fs.writeFileSync(outputPath, markdown);
            console.log('Documento DATABASE_MAP.md gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao processar o JSON:', error);
            console.log('Data received:', data.substring(0, 100));
        }
    });
}).on('error', (err) => {
    console.error('Erro na requisição:', err);
});
