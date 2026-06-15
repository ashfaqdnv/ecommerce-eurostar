const request = require('supertest');
const { expect } = require('chai');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';

describe('API Path Coverage Tests', function() {
  this.timeout(10000);

  let authToken = null;
  let newUserToken = null;

  // Test data from README.md
  const existingUser = {
    email: 'alice@example.com',
    password: 'password123'
  };

  const newUser = {
    email: `testuser-${Date.now()}@example.com`,
    password: 'testpass123',
    name: 'Test User'
  };

  const validProducts = [
    { productId: 1, quantity: 2 },
    { productId: 3, quantity: 1 }
  ];

  // ==================== PATH 1: GET /healthcheck ====================
  describe('GET /healthcheck', function() {
    it('should return 200 with health status', function(done) {
      request(BASE_URL)
        .get('/healthcheck')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal('ok');
          expect(res.body).to.have.property('timestamp');
          done();
        });
    });
  });

  // ==================== PATH 2: POST /register ====================
  describe('POST /register', function() {
    it('should register a new user and return JWT token with 201 status', function(done) {
      request(BASE_URL)
        .post('/register')
        .send(newUser)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('id');
          expect(res.body.user).to.have.property('email');
          expect(res.body.user.email).to.equal(newUser.email);
          expect(res.body.user).to.have.property('name');
          expect(res.body).to.have.property('token');
          expect(res.body.token).to.be.a('string');
          
          // Store token for checkout test
          newUserToken = res.body.token;
          
          done();
        });
    });

    it('should return 400 if required fields are missing', function(done) {
      request(BASE_URL)
        .post('/register')
        .send({ email: 'test@example.com' })
        .end(function(err, res) {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 409 if email already exists', function(done) {
      request(BASE_URL)
        .post('/register')
        .send({
          email: 'alice@example.com',
          password: 'password123',
          name: 'Alice Test'
        })
        .end(function(err, res) {
          expect(res.status).to.equal(409);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  // ==================== PATH 3: POST /login ====================
  describe('POST /login', function() {
    it('should login existing user and return JWT token with 200 status', function(done) {
      request(BASE_URL)
        .post('/login')
        .send(existingUser)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email');
          expect(res.body.user.email).to.equal(existingUser.email);
          expect(res.body).to.have.property('token');
          expect(res.body.token).to.be.a('string');
          
          // Store token for checkout test
          authToken = res.body.token;
          
          done();
        });
    });

    it('should return 400 if email or password is missing', function(done) {
      request(BASE_URL)
        .post('/login')
        .send({ email: 'test@example.com' })
        .end(function(err, res) {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 401 if credentials are invalid', function(done) {
      request(BASE_URL)
        .post('/login')
        .send({
          email: 'alice@example.com',
          password: 'wrongpassword'
        })
        .end(function(err, res) {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  // ==================== PATH 4: POST /checkout ====================
  describe('POST /checkout', function() {
    it('should checkout successfully with cash payment and 10% discount', function(done) {
      // Ensure we have a token
      if (!authToken) {
        request(BASE_URL)
          .post('/login')
          .send(existingUser)
          .end(function(err, res) {
            authToken = res.body.token;
            performCheckoutWithCash();
          });
      } else {
        performCheckoutWithCash();
      }

      function performCheckoutWithCash() {
        request(BASE_URL)
          .post('/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            items: validProducts,
            paymentMethod: 'cash'
          })
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('order');
            expect(res.body.order).to.have.property('items');
            expect(res.body.order).to.have.property('subtotal');
            expect(res.body.order).to.have.property('discount');
            expect(res.body.order.discount).to.be.greaterThan(0); // 10% cash discount
            expect(res.body.order).to.have.property('total');
            expect(res.body.order).to.have.property('paymentMethod');
            expect(res.body.order.paymentMethod).to.equal('cash');
            done();
          });
      }
    });

    it('should checkout successfully with credit_card payment and no discount', function(done) {
      if (!authToken) {
        request(BASE_URL)
          .post('/login')
          .send(existingUser)
          .end(function(err, res) {
            authToken = res.body.token;
            performCheckoutWithCreditCard();
          });
      } else {
        performCheckoutWithCreditCard();
      }

      function performCheckoutWithCreditCard() {
        request(BASE_URL)
          .post('/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            items: validProducts,
            paymentMethod: 'credit_card'
          })
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('order');
            expect(res.body.order).to.have.property('items');
            expect(res.body.order).to.have.property('subtotal');
            expect(res.body.order).to.have.property('discount');
            expect(res.body.order.discount).to.equal(0); // No discount for credit card
            expect(res.body.order).to.have.property('total');
            expect(res.body.order.paymentMethod).to.equal('credit_card');
            done();
          });
      }
    });

    it('should return 401 if authorization token is missing', function(done) {
      request(BASE_URL)
        .post('/checkout')
        .send({
          items: validProducts,
          paymentMethod: 'cash'
        })
        .end(function(err, res) {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 401 if authorization token is invalid', function(done) {
      request(BASE_URL)
        .post('/checkout')
        .set('Authorization', 'Bearer invalidtoken')
        .send({
          items: validProducts,
          paymentMethod: 'cash'
        })
        .end(function(err, res) {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 400 if payment method is invalid', function(done) {
      if (!authToken) {
        request(BASE_URL)
          .post('/login')
          .send(existingUser)
          .end(function(err, res) {
            authToken = res.body.token;
            performInvalidPaymentTest();
          });
      } else {
        performInvalidPaymentTest();
      }

      function performInvalidPaymentTest() {
        request(BASE_URL)
          .post('/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            items: validProducts,
            paymentMethod: 'bitcoin'
          })
          .end(function(err, res) {
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            done();
          });
      }
    });

    it('should return 404 if product does not exist', function(done) {
      if (!authToken) {
        request(BASE_URL)
          .post('/login')
          .send(existingUser)
          .end(function(err, res) {
            authToken = res.body.token;
            performNotFoundTest();
          });
      } else {
        performNotFoundTest();
      }

      function performNotFoundTest() {
        request(BASE_URL)
          .post('/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            items: [{ productId: 999, quantity: 1 }],
            paymentMethod: 'cash'
          })
          .end(function(err, res) {
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error');
            done();
          });
      }
    });

    it('should return 400 if insufficient stock', function(done) {
      if (!authToken) {
        request(BASE_URL)
          .post('/login')
          .send(existingUser)
          .end(function(err, res) {
            authToken = res.body.token;
            performInsufficientStockTest();
          });
      } else {
        performInsufficientStockTest();
      }

      function performInsufficientStockTest() {
        request(BASE_URL)
          .post('/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            items: [{ productId: 1, quantity: 10000 }],
            paymentMethod: 'cash'
          })
          .end(function(err, res) {
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            done();
          });
      }
    });
  });
});
