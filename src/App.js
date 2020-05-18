import React, { Component, useState } from 'react';
import './App.css';
import { Container, Row, Col, Form, Button, Alert, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import bsCustomFileInput from 'bs-custom-file-input'
import { Route } from 'react-router';
import Moment from 'react-moment';

import {
  BrowserRouter as Router,
  Switch,
  Link
} from "react-router-dom";

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact component={AddUser}></Route>
          <Route path="/findUser" component={FindUser}></Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

class AddUser extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      mobileNo: '',
      image: '',
      error: '',
      visiblity: false
    };
  }

  onChange = (e) => {
    const state = this.state
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  // handle change event of input file
  onChangeFile = e => {
    console.log(e.target.files)
    const state = this.state
    state[e.target.name] = e.target.files[0];
    this.setState(state);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { name, mobileNo, image } = this.state;

    const formData = new FormData();
    formData.append("image", image, image.name);
    formData.append('mobileNo', mobileNo);
    formData.append('name', name);

    axios.post('/api/addUser', formData)
      .then((response) => {
        console.log(response)
        this.setState({ visiblity: false })
        if (response.data.error) {
          this.setState({ error: response.data.error, visiblity: true })
        }
      }).catch(console.error);
    e.target.reset();
  }


  render() {
    bsCustomFileInput.init()
    return (
      <Container fluid>
        <Alert variant="success">Add User</Alert>
        <Row>
          <Col xs={6} md={2}></Col>

          <Col xs={6} md={4}>
            <Form noValidate onSubmit={this.onSubmit} enctype="multipart/form-data" name="myForm">
              <Form.Group controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" placeholder="Enter Name" onChange={this.onChange} />
              </Form.Group>

              <Form.Group controlId="formBasicMobile">
                <Form.Label>Mobile</Form.Label>
                <Form.Control type="text" placeholder="Mobile Number" name="mobileNo" onChange={this.onChange} />
              </Form.Group>
              <Form.Group controlId="formBasicImage" class="custom-file">
                <Form.Label >Image</Form.Label>
                <Form.File
                  id="custom-file-translate-scss"
                  label="Custom file input"
                  lang="en"
                  name="image"
                  class="custom-file-input"
                  custom
                  onChange={this.onChangeFile}
                />
              </Form.Group>
              {/*  <div class="custom-file">
                <input id="inputGroupFile01" type="file" class="custom-file-input" name="image" onChange={this.onChangeFile} />
                <label class="custom-file-label" for="inputGroupFile01">Choose file</label>
              </div> */}
              <Button variant="primary" type="submit"> Submit</Button>
            </Form>
            {this.state.visiblity && (
              <Alert variant="danger">{this.state.error}</Alert>
            )}
          </Col>
          <Col xs={6} md={2}>
            <Link to="/findUser">Find User</Link>
          </Col>
          <Col xs={6} md={4}></Col>
        </Row>
      </Container>
    );
  }
}

class FindUser extends Component {

  constructor() {
    super();
    this.state = {
      mobileNo: '',
      visiblity: false,
      data: null
    };
  }
  onSubmit = (e) => {
    e.preventDefault();

    console.log("formData ", this.state)
    axios.post('/api/findUser', { "mobileNo": this.state.mobileNo })
      .then((response) => {
        console.log(response)
        this.setState({ data: response.data.data, visiblity: true })
      });
  }

  onChange = (e) => {
    const state = this.state
    state[e.target.name] = e.target.value;
    console.log("state === ", state)
    this.setState(state);
  }

  render() {
    return (
      <Container fluid>
        <Alert variant="success">Find User</Alert>
        <Row>
          <Col xs={6} md={2}></Col>
          <Col xs={6} md={4}>
            <Form onSubmit={this.onSubmit}>
              <Form.Group controlId="formBasicName">
                <Form.Label>Mobile No</Form.Label>
                <Form.Control type="text" name="mobileNo" placeholder="Enter Mobile Number" onChange={this.onChange} />
              </Form.Group>
              <Button variant="primary" type="submit"> Find</Button>
            </Form>
          </Col>
          <Col xs={6} md={2}>
            <Link to="/">Add User</Link>
          </Col>

          <Col xs={6} md={4}>
            {this.state.visiblity && (
              <Card style={{ width: '18rem' }}>
                <ListGroup variant="flush">
                  <ListGroup.Item>Name: {this.state.data.name}</ListGroup.Item>
                  <ListGroup.Item>Moble: {this.state.data.mobileNo}</ListGroup.Item>
                  <ListGroup.Item>Created At:  <Moment format="DD/MM/YYYY">{this.state.data.createdAt}</Moment> </ListGroup.Item>
                </ListGroup>
                <Card.Img variant="top" src={this.state.data.image} />
              </Card>
            )}
          </Col>
        </Row>
      </Container>

    );
  }
}


function NotFound() {
  return (
    <div>
      <h1>Sorry, can’t find that.</h1>
    </div>
  );
}
