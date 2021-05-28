import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import { Storage } from 'aws-amplify';

import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  avatar: {
    // border: '1px solid rgba(255,255,255,0.3)',
  },
}));

export default function ProjectAvatar({
  projectId,
  name,
  size = 24,
  variant = 'square',
}) {
  const classes = useStyles();

  const [uri, setUri] = useState();
  // const [s3Key, setS3Key] = useState();

  // useEffect(() => {
  //   (async () => {
  //     setUri(await Storage.get(s3Key));
  //   })();
  // }, [s3Key]);

  useEffect(() => {
    // setS3Key(`users/${username}/avatar.jpeg`);
    setUri(`https://avatars.dicebear.com/api/jdenticon/${projectId}.svg`);
  }, [projectId]);

  return (
    <Avatar
      alt={''}
      src={uri}
      variant={variant}
      style={{ height: size, width: size, fontSize: size * 0.6 }}
      className={classes.avatar}
    >
      {(name || projectId || ' ')[0]}
    </Avatar>
  );
}

ProjectAvatar.propTypes = {
  projectId: PropTypes.string.isRequired,
  name: PropTypes.string,
  size: PropTypes.number,
  variant: PropTypes.string,
};