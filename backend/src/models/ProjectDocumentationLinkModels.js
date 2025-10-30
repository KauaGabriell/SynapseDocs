export default (sequelize) => {
  const ProjectDocumentationLink = sequelize.define(
    'ProjectDocumentationLink',
    {
      //     ESTE OBJETO FICA VAZIO
      //    As chaves estrangeiras 'id_project' e 'id_apiDocumentation'
      //    serão criadas automaticamente pela definição da *relação*
      //    no arquivo index.js.
    },
    {
      tableName: 'project_documentation_link', // Nome exato da tabela
      timestamps: false,
    },
  );

  return ProjectDocumentationLink;
};
