#!/usr/bin/env python3.6

# inspired from https://websockets.readthedocs.io/en/stable/intro.html
# WS server example

import asyncio
import json
import logging
import websockets
import time
import numpy as np

from constants import *
from utils import *
from gameobjects import *

# enable logging

logging.basicConfig(level=logging.DEBUG)

# game state

class GameState:
	def __init__(self):
		self.players = {}
		self.boxes = {}
		self.ball = Ball(0)
		self.next_gameobject_id = 1

state = GameState()

## message building

def message_object_new(gameobject):
	message = gameobject.get_json_state(True)
	message['type'] = 'object_new'
	return json.dumps(message)

def message_object_status(gameobject):
	message = gameobject.get_json_state(False)
	message['type'] = 'object_state'
	return json.dumps(message)

def message_object_part(gameobject):
	return json.dumps({'type': 'object_part', 'id': gameobject.id})

def message_player_welcome(player):
	return json.dumps({'type': 'player_welcome', 'id': player.id})

## notification helper methods

async def notify_players(source_player, messager_builder_function):
	if state.players:       # asyncio.wait doesn't accept an empty list
		message = messager_builder_function(source_player)
		await asyncio.wait([websocket.send(message) for websocket in state.players])

## network processing callbacks

async def register(websocket):
	# receive the name from this player
	name = await websocket.recv()
	# TODO: check for name duplications
	player = Player(name, state.next_gameobject_id)
	player.pos[1] = 10
	websocket.send(message_player_welcome(player))
	state.next_gameobject_id += 1
	# send the current state to this player
	if state.ball:
		await websocket.send(message_object_new(state.ball))
	for other_websocket, other_player in state.players.items():
		await websocket.send(message_object_new(other_player))
	# add to the list of players
	state.players[websocket] = player
	# tell all players about this new one
	await notify_players(player, message_object_new)
	# print and return
	print(f"> {name} connected")
	return player

async def unregister(websocket):
	# remove from the list of players
	player = state.players[websocket]
	del state.players[websocket]
	# tell others players about this disconnection
	await notify_players(player, message_object_part)
	print(f"> {player.name} disconnected")

## client processing code

async def process_client(websocket, path):
	# register(websocket) sends user_event() to websocket
	player = await register(websocket)
	try:
		# process messages from this player
		async for message in websocket:
			data = json.loads(message)
			if data['action'] == 'move':
				# set the speed of the player
				player.move(data['speed'], 0.1)
				await notify_players(player, message_object_status)
			elif data['action'] == 'weapon_trigger':
				cur_time = time.time()
				#if cur_time - player.last_fire_time < TIME_BETWEEN_FIRE:
					## we are not allowed to fire
					#continue
				## see if any other player has been hit
				#did_hit = False
				#for other_websocket, other_player in players.items():
					#if other_player == player:
						#continue
					## if we hit the other
					#if np.linalg.norm(other_player.pos - player.pos) < DIST_TO_HIT:
						#did_hit = True
						## increase our hits
						#player.hits += 1
						## disable fire for other
						#other_player.last_fire_time = cur_time
				## if we did hit, update the client
				#if did_hit:
					#await notify_players(player, message_object_status)
				#player.last_fire_time = cur_time
			elif data['action'] == 'power_trigger':
				logging.info("Got power trigger, unimplemented yet")
			else:
				logging.error("unsupported event: {}", data)
	finally:
		await unregister(websocket)

## server-side state update

async def run_state():
	last_time = time.time()
	while True:
		# main game logic loop
		cur_time = time.time()
		delta_time = cur_time - last_time

		# ball collision
		if state.ball is not None and state.ball.step(delta_time):
			await notify_players(state.ball, message_object_status)

		# loop over players
		for websocket, player in state.players.items():

			# collisions with walls
			if player.step(delta_time):
				await notify_players(player, message_object_status)

			# ball fetching
			fetch_ball = False
			if state.ball and player.does_collide(state.ball):
				player.has_ball = True
				await notify_players(player, message_object_status)
				await notify_players(state.ball, message_object_part)
				state.ball = None

			# collision with other player
			for _, other_player in state.players.items():
				if player == other_player:
					continue
				deinterlace_vector = np.empty(2)
				if player.does_collide(other_player, deinterlace_vector):

					# save previous state
					prev_player_pos = player.pos
					prev_other_pos = other_player.pos
					prev_player_velocity = np.inner(player.speed, player.speed)
					prev_other_velocity = np.inner(other_player.speed, other_player.speed)
					had_ball = player.has_ball
					other_had_ball = other_player.has_ball

					# handle deinterlacing
					player.pos += deinterlace_vector * 0.5
					other_player.pos -= deinterlace_vector * 0.5

					# reduce speed
					player.speed *= -0.5
					other_player.speed *= -0.5
					player_velocity = np.inner(player.speed, player.speed)
					other_velocity = np.inner(other_player.speed, other_player.speed)

					# loose ball
					if had_ball:
						player.has_ball = False
						state.ball = Ball(0)
						u = unitv(deinterlace_vector)
						state.ball.pos = player.pos + u * (player.r + state.ball.r + BALL_DROP_DIST)
						state.ball.speed = u * BALL_DROP_VELOCITY
					if other_had_ball:
						other_player.has_ball = False
						state.ball = Ball(0)
						u = unitv(deinterlace_vector)
						state.ball.pos = other_player.pos + u * -(other_player.r + state.ball.r + BALL_DROP_DIST)
						state.ball.speed = u * -BALL_DROP_VELOCITY

					# notify when necessary
					if had_ball or other_had_ball:
						await notify_players(state.ball, message_object_new)
					if (had_ball or
						np.linalg.norm(player.pos - prev_player_pos) > MIN_DIST_TO_NOTIFY or
						abs(player_velocity - prev_player_velocity) > MIN_DELTA_VELOICTY_TO_NOTIFY):
						await notify_players(player, message_object_status)
					if (other_had_ball or
						(np.linalg.norm(other_player.pos - prev_other_pos) > MIN_DIST_TO_NOTIFY) or
						abs(other_velocity - prev_other_velocity) > MIN_DELTA_VELOICTY_TO_NOTIFY):
						await notify_players(other_player, message_object_status)
		last_time = cur_time
		await asyncio.sleep(UPDATE_PERIOD)

## main code

loop = asyncio.get_event_loop()
loop.run_until_complete(websockets.serve(process_client, '', 6789))
loop.run_until_complete(run_state())
