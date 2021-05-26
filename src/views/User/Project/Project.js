import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


import { request } from 'utils/graph';
import { getProject } from 'graphql/queries';
import ProjectEditButton from 'forms/ProjectForm/ProjectEditButton';

import UserList from 'views/User/UserList';
import TagChip from 'components/TagChip';
import KeywordChip from 'components/KeywordChip';
import NeedChip from 'components/NeedChip';
import DataJoinEditor from 'components/DataJoinEditor';
import Note from 'components/Note';
import VisitButton from 'components/VisitButton';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  card: {
    padding: theme.spacing(4),
    paddingRight: theme.spacing(2),
    minHeight: 600,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(1),
  },
  listItemText: {
    marginLeft: theme.spacing(1),
  },
  header: {
    marginTop: theme.spacing(2),
  },
}));

export default function Project({ id: inId, computedMatch, match }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [id, setId] = useState();
  const [project, setProject] = useState();
  const [keywords, setKeywords] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [tags, setTags] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (inId) {
      setId(inId);
    } else
    if (computedMatch || match) {
      const { params: { id } } = computedMatch || match;
      setId(id);
    }
  }, [inId, computedMatch, match]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: { getProject: data } } = await request(getProject, { id });
      console.log('project', data);
      setProject(data);
      setKeywords(data.keywords.items.map(({ keyword }) => keyword));
      setNeeds(data.needs.items.map(({ need }) => need));
      setTags(data.tags.items.map(({ tag }) => tag));

      const username = localStorage.getItem('app:username');
      const canEdit = [data.owner, ...data.managers].includes(username);
      setCanEdit(canEdit);
    })();
  }, [id, lastUpdatedAt]);

  if (!project) {
    return (
      <Container className={classes.container} style={{ textAlign: 'center' }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Card className={classes.card}>
        <Grid container spacing={4}>
          <Grid item xs={3} container spacing={2} style={{ height: 100 }}>
            <Grid item xs={12}>
              <Typography variant="h4">
                {project.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {project.summary || ''}
              </Typography>
              <Note data={project.description} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                {t('project_links')}
              </Typography>
              {project.links.map((link, index)=>(
                <div key={index} style={{ margin: 1, display: 'inline-block' }}>
                  <VisitButton
                    title={link.name}
                    url={link.url}
                    variant={'outlined'}
                    color={'secondary'}
                  />
                </div>
              ))}
            </Grid>
            {canEdit &&
            <Grid item xs={12}>
              <ProjectEditButton
                mode={'edit'}
                item={project}
                onUpdate={() => setLastUpdatedAt(Date.now())}
              />
            </Grid>}
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                {t('project_tags')}
                {canEdit &&
                <DataJoinEditor
                  title={t('project_tags')}
                  mode={'project-tag'}
                  projectId={project.id}
                  joinData={project.tags.items}
                  onUpdate={() => setLastUpdatedAt(Date.now())}
                />}
              </Typography>
              {tags.map((item, index)=>(
                <TagChip key={index} data={item} size="medium" />
              ))}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                {t('project_keywords')}
                {canEdit &&
                <DataJoinEditor
                  title={t('project_keywords')}
                  mode={'project-keyword'}
                  projectId={project.id}
                  joinData={project.keywords.items}
                  onUpdate={() => setLastUpdatedAt(Date.now())}
                />}
              </Typography>
              {keywords.map((item, index)=>(
                <KeywordChip key={index} data={item} size="medium" />
              ))}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                {t('project_needs')}
                {canEdit &&
                <DataJoinEditor
                  title={t('project_needs')}
                  mode={'project-need'}
                  projectId={project.id}
                  joinData={project.needs.items}
                  onUpdate={() => setLastUpdatedAt(Date.now())}
                />}
              </Typography>
              {needs.map((item, index)=>(
                <NeedChip key={index} data={item} size="medium" />
              ))}
            </Grid>
          </Grid>
          <Grid item xs={9} container spacing={2}>
            <Tabs
              value={tabIndex}
              indicatorColor="primary"
              textColor="primary"
              onChange={(e, newValue)=>setTabIndex(newValue)}
              style={{ width: '100%' }}
              aria-label="disabled tabs example"
            >
              <Tab label={t('project_contributors')} />
              <Tab label={t('project_tasks')} disabled />
              <Tab label={t('project_pastProposals')} disabled />
            </Tabs>

            <Grid item xs={12}>
              <UserList
                data={project.contributors.items.map(({ user }) => user)}
                hideTitle={true}
              />
            </Grid>
            <div style={{ flex: 1 }} />
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}

Project.propTypes = {
  id: PropTypes.string,
  computedMatch: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};