import {
  Dialog,
  DialogTitle,
  Grid,
  List,
  ListItem,
  TextField,
} from "@material-ui/core";
import React, { useCallback, useReducer, useState, useEffect } from "react";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Button from "components/CustomButtons/Button.js";
import Loading from "views/Components/Loading/Loading";

import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";

//import logo from "../../assets/img/examples/teamlogo.png";

const initialState = {
  team: {
    socialID: "",
    description: "",
    code: "",
    name: "",
    locationID: null,
    profileURL: "team-default-" + Math.ceil(Math.random() * 20) + ".png",
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_INPUT":
      return {
        ...state,
        team: {
          ...state.team,
          [action.name]: action.value,
        },
      };
    case "INIT_INPUT":
      return {
        ...state,
        team: {
          socialID: "",
          description: "",
          code: "",
          name: "",
          locationID: null,
          profileURL: "team-default-" + Math.ceil(Math.random() * 20) + ".png",
        },
      };
    default:
      return state;
  }
};
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  large: {
    width: theme.spacing(20),
    height: theme.spacing(20),
  },
  listRoot: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: theme.palette.background.paper,
  },
}));

function CreateTeamDialog({ open, onClose, idData, refreshTeam }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [guList, setGuList] = useState([]);
  const [sidoList, setSidoList] = useState([]);
  const [possible, setPossible] = useState(false); // 이름 중복 확인, 사용 가능 한지

  const { team } = state;
  const classes = useStyles();
  team.socialID = idData;

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({
      type: "CHANGE_INPUT",
      name,
      value,
    });
  }, []);

  // 지역 목록 불러오기
  useEffect(() => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_SERVER_BASE_URL}/api/location`,
    })
      .then((res) => {
        const list = [];
        res.data.map((location) => {
          if (list.find((sido) => sido === location.sido) === undefined)
            list.push(location.sido);
          return 0;
        });
        setSidoList(list);
        return;
      })
      .catch((e) => {
        console.log("error", e);
      });
  }, []);

  const createTeam = useCallback(async () => {
    if (team.name === "") {
      alert("팀명을 작성해주세요!");
    } else if (team.locationID === null) {
      alert("지역을 선택해주세요!");
    } else if (team.description === "") {
      alert("팀 설명을 작성해주세요!");
    } else if (!possible) {
      alert("팀 이름 중복확인을 진행해주세요!");
    } else {
      setLoading(true);
      await axios({
        method: "post",
        url: `${process.env.REACT_APP_SERVER_BASE_URL}/api/team`,
        data: team,
      })
        .then(() => {
          alert("팀 생성 완료!");
          dispatch({
            type: "INIT_INPUT",
          });
          onClose();
          refreshTeam();
        })
        .catch(() => {
          console.log("team create fail!");
          alert("팀 생성 실패-잠시후 다시 시도해주세요");
          onClose();
          return;
        });
      setLoading(false);
    }
  });

  const checkTeamName = (name) => {
    if (name === "") {
      alert("이름을 입력해주세요!");
    } else {
      axios({
        method: "get",
        url: `${process.env.REACT_APP_SERVER_BASE_URL}/api/team/check/${name}`,
      })
        .then((res) => {
          if (res.data) {
            alert("이미 존재하는 이름입니다.");
          } else {
            alert("사용 가능한 이름입니다.");
            setPossible(true);
          }
        })
        .catch((e) => {
          console.log("error" + e);
        });
    }
  };

  const sidoChange = (event) => {
    // 시도 이름으로 구, locationID 불러오기
    axios({
      method: "post",
      url: `${process.env.REACT_APP_SERVER_BASE_URL}/api/location`,
      data: {
        sido: event.target.value,
      },
    })
      .then((res) => {
        const list = [];
        res.data.map((location) => {
          list.push(location);
          return 0;
        });
        setGuList(list);
        return;
      })
      .catch((e) => {
        console.log("error", e);
      });
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>팀 생성하기</DialogTitle>
      {loading ? (
        <div
          style={{
            width: "80%",
            margin: "auto",
          }}
        >
          <Loading />
        </div>
      ) : (
        <>
          <Grid container>
            <Grid item xs></Grid>
            <Grid item xs={7}>
              <List className={classes.listRoot}>
                <ListItem>
                  <TextField
                    name="name"
                    fullWidth
                    label="팀명"
                    onChange={(e) => {
                      onChange(e);
                      setPossible(false);
                    }}
                  />
                  <Button
                    color="github"
                    onClick={() => {
                      checkTeamName(team.name);
                    }}
                    style={{ width: "30%", padding: "0 auto" }}
                  >
                    이름 중복 확인
                  </Button>
                </ListItem>
                <ListItem>
                  <label>지역</label>
                  <FormControl style={{ width: "45%", padding: "0 16px" }}>
                    <Select
                      labelId="sido"
                      id="sido-select"
                      onChange={sidoChange}
                      inputProps={{
                        classes: {
                          icon: "white",
                        },
                      }}
                    >
                      <MenuItem disabled value="">
                        <em>시도</em>
                      </MenuItem>
                      {sidoList.map((s) => (
                        <MenuItem value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl style={{ width: "45%" }}>
                    <Select
                      name="locationID"
                      labelId="gu"
                      id="gu-select"
                      onChange={(e) => {
                        onChange(e);
                        // guChange(e);
                      }}
                    >
                      <MenuItem disabled value="">
                        <em>시군구</em>
                      </MenuItem>
                      {guList.map((g) => (
                        <MenuItem value={g.locationID}>{g.gu}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>
                <ListItem>
                  <TextField
                    name="description"
                    fullWidth
                    label="팀소개"
                    onChange={onChange}
                  />
                </ListItem>
              </List>
              {/* <TextField fullWidth label="지역" /> */}
            </Grid>
            <Grid item xs></Grid>
          </Grid>
          <Grid container justify="center">
            <List>
              <ListItem>
                <Button variant="contained" color="danger" onClick={createTeam}>
                  생성
                </Button>
              </ListItem>
            </List>
          </Grid>
        </>
      )}
    </Dialog>
  );
}

export default CreateTeamDialog;
